import type { APIRoute } from 'astro'
import {
  getValidAccessToken,
  getAthleteHistory,
  calculatePerformanceMetrics,
} from '@/lib/strava'
import { getDb } from '@/db'
import { athletes, ftpHistory } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const GET: APIRoute = async ({ params, locals }) => {
  const { id } = params
  if (!id) {
    return new Response('Missing athlete ID', { status: 400 })
  }

  try {
    const env = (locals as any).runtime.env
    const accessToken = await getValidAccessToken(parseInt(id), env)

    // 1. Get athlete metadata (preference)
    const db = getDb(env)
    const result = await db
      .select({
        metricPreference: athletes.metricPreference,
      })
      .from(athletes)
      .where(eq(athletes.id, parseInt(id)))
      .limit(1)

    const athlete = result[0]
    const preference =
      (athlete?.metricPreference as 'heart_rate' | 'power') || 'heart_rate'

    // 2. Fetch FTP history
    const ftpHistoryResult = await db
      .select({
        ftp: ftpHistory.ftp,
        date: ftpHistory.date,
      })
      .from(ftpHistory)
      .where(eq(ftpHistory.athleteId, parseInt(id)))

    // 3. Fetch historical data (last 60 days)
    const activities = await getAthleteHistory(accessToken)

    // 4. Calculate metrics with preference
    const metrics = calculatePerformanceMetrics(
      activities,
      preference,
      ftpHistoryResult,
    )

    return new Response(
      JSON.stringify({
        ...metrics,
        metricPreference: preference,
        ftpHistory: ftpHistoryResult,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    console.error('API Error:', error)
    return new Response('Failed to calculate metrics', { status: 500 })
  }
}
