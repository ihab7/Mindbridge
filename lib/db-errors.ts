// Centralized handling for the "table/column written in code but never migrated"
// failure class. Postgres raises 42P01 (undefined_table) and 42703
// (undefined_column) for exactly this. In development we surface a clear,
// actionable line; in production we log the real error server-side and hand the
// client a generic message (never the raw SQL error).

const UNDEFINED_TABLE = "42P01"
const UNDEFINED_COLUMN = "42703"

function pgCode(err: unknown): string | undefined {
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as { code?: unknown }).code
    return typeof code === "string" ? code : undefined
  }
  return undefined
}

export function isSchemaMismatch(err: unknown): boolean {
  const code = pgCode(err)
  return code === UNDEFINED_TABLE || code === UNDEFINED_COLUMN
}

/** Extract the missing relation/column name from the error message, if present. */
function missingObject(err: unknown): string | null {
  const msg = String((err as { message?: unknown } | null)?.message ?? "")
  const rel = msg.match(/relation "([^"]+)" does not exist/i)
  if (rel) return `relation ${rel[1]}`
  const col = msg.match(/column "?([\w.]+)"? .*does not exist/i)
  if (col) return `column ${col[1]}`
  return null
}

/**
 * Log a DB error with the right amount of detail for the environment.
 * `context` is a short label for where it happened (e.g. "practitioner-profile").
 */
export function logDbError(err: unknown, context: string): void {
  if (isSchemaMismatch(err) && process.env.NODE_ENV !== "production") {
    const what = missingObject(err) ?? "a relation/column"
    // console.warn (not console.error) on purpose: this is a handled, actionable
    // setup condition — the caller degrades gracefully (empty form / generic
    // 500). Next.js's dev overlay elevates console.error into a full-screen
    // "Console Error" that looks like a crash; a warn keeps the hint in the
    // terminal without masking a page that actually rendered fine.
    // eslint-disable-next-line no-console
    console.warn(
      `[schema] ${context}: ${what} missing. ` +
        `Run: node --env-file=.env.local scripts/setup-db.mjs --migrate-only`,
    )
    return
  }
  // Production (or any non-schema, genuinely unexpected error): log server-side.
  // eslint-disable-next-line no-console
  console.error(`[db] ${context}:`, err)
}
