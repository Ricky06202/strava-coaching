import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

export function getDb(env: any) {
  // In Cloudflare Workers/Pages, the D1 binding is provided in the environment
  return drizzle(env.DB, { schema })
}
