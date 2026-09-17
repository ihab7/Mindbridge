// Maps the linking API's error codes (lib/linking/codes.ts) to user-facing
// copy. Never shows a technical message.
export type LinkingErrorCode = "code_format" | "code_invalid" | "already_linked" | "generic"

export function linkingErrorMessage(
  t: (key: string, values?: Record<string, string | number>) => string,
  code: string | undefined,
  practitionerName?: string,
): string {
  switch (code) {
    case "code_format":
      return t("linking.errors.format")
    case "code_invalid":
      return t("linking.errors.invalid")
    case "already_linked":
      return t("linking.errors.alreadyLinked", { name: practitionerName ?? "" })
    default:
      return t("linking.errors.generic")
  }
}
