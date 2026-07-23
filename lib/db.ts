import { neon } from "@neondatabase/serverless"

type SqlClient = ReturnType<typeof neon>

let cachedSql: SqlClient | null = null

export function getSql(): SqlClient {
  if (!cachedSql) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    cachedSql = neon(connectionString)
  }
  return cachedSql
}
