import { readFileSync } from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { neon } from "@neondatabase/serverless"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set.")
  process.exit(1)
}

const sql = neon(connectionString)

function splitStatements(sqlText) {
  // Strip line comments and split on semicolons followed by a newline
  const withoutComments = sqlText.replace(/--.*$/gm, "")

  const statements = []
  let current = ""
  let i = 0
  let inDollarBlock = false
  let dollarTag = "$$"

  while (i < withoutComments.length) {
    const ch = withoutComments[i]

    // Enter/exit dollar-quoted block: $$...$$ or $tag$...$tag$
    if (ch === "$" && !inDollarBlock) {
      const match = withoutComments.slice(i).match(/^\$[A-Za-z0-9_]*\$/)
      if (match) {
        inDollarBlock = true
        dollarTag = match[0]
        current += dollarTag
        i += dollarTag.length
        continue
      }
    }

    if (inDollarBlock && ch === "$" && withoutComments.startsWith(dollarTag, i)) {
      inDollarBlock = false
      current += dollarTag
      i += dollarTag.length
      continue
    }

    // Split statements at semicolons (only when not in dollar block)
    if (!inDollarBlock && ch === ";") {
      const stmt = current.trim()
      if (stmt.length > 0) statements.push(stmt)
      current = ""
      i += 1
      continue
    }

    current += ch
    i += 1
  }

  const tail = current.trim()
  if (tail.length > 0) statements.push(tail)

  return statements
}

async function runSqlFile(relativePath) {
  const fullPath = path.join(__dirname, relativePath)
  const fileContents = readFileSync(fullPath, "utf8")
  const statements = splitStatements(fileContents)

  for (const statement of statements) {
    const preview = statement.replace(/\s+/g, " ").slice(0, 80)
    console.log(`Running: ${preview}...`)
    await sql.query(statement)
  }
}

async function main() {
  try {
    console.log("Running migrate.sql...")
    await runSqlFile("./migrate.sql")

    const migrateOnly = process.argv.includes("--migrate-only")
    if (!migrateOnly) {
      console.log("Running seed.sql...")
      await runSqlFile("./seed.sql")
    }

    console.log("Database migration and seed completed successfully.")
    process.exit(0)
  } catch (error) {
    console.error("Error running database setup:", error)
    process.exit(1)
  }
}

main()

