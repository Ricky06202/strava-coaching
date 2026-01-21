import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const athletes = sqliteTable('athletes', {
  id: integer('id').primaryKey(), // Strava Athlete ID
  firstname: text('firstname'),
  lastname: text('lastname'),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  expiresAt: integer('expires_at').notNull(), // Timestamp
  metricPreference: text('metric_preference').default('heart_rate'), // 'heart_rate' or 'power'
})

export const ftpHistory = sqliteTable('ftp_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  athleteId: integer('athlete_id')
    .notNull()
    .references(() => athletes.id),
  ftp: integer('ftp').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
})
