import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const athletes = sqliteTable('athletes', {
  id: integer('id').primaryKey(), // Strava Athlete ID
  firstname: text('firstname'),
  lastname: text('lastname'),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  expiresAt: integer('expires_at').notNull(), // Timestamp
})
