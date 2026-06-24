// Type declarations for Cloudflare Workers bindings
// These supplement @cloudflare/workers-types for the LSP

interface Fetcher {
  fetch(request: Request): Promise<Response>
}

interface D1Database {
  prepare(sql: string): D1PreparedStatement
}

interface D1PreparedStatement {
  bind(...args: unknown[]): D1PreparedStatement
  run(): Promise<{ meta: { last_row_id: number } }>
  all<T = unknown>(): Promise<{ results: T[] }>
}

interface D1Result<T = unknown> {
  results: T[]
  success: boolean
}
