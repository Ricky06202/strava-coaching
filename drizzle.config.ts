import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: 'dae8c43e3c007dc8c23f539dfab3af6c',
    databaseId: '7052aef0-2040-485a-b57e-822b589b6709',
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
})
