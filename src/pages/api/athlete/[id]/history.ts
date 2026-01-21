import type { APIRoute } from 'astro'
import {
  getValidAccessToken,
  getAthleteHistory,
  calculatePerformanceTimeSeries,
} from '@/lib/strava'
import { getDb } from '@/db'
import { athletes, ftpHistory } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const GET: APIRoute = async ({ params, locals, url }) => {
  const { id } = params
  const days = parseInt(url.searchParams.get('days') || '365')

  if (!id) {
    return new Response('Missing athlete ID', { status: 400 })
  }

  try {
    const env = (locals as any).runtime.env
    const accessToken = await getValidAccessToken(parseInt(id), env)

    const db = getDb(env)
    const result = await db
      .select({ metricPreference: athletes.metricPreference })
      .from(athletes)
      .where(eq(athletes.id, parseInt(id)))
      .limit(1)

    const athlete = result[0]
    const preference =
      (athlete?.metricPreference as 'heart_rate' | 'power') || 'heart_rate'

    const ftpHistoryResult = await db
      .select({ ftp: ftpHistory.ftp, date: ftpHistory.date })
      .from(ftpHistory)
      .where(eq(ftpHistory.athleteId, parseInt(id)))

    // Fetch history for 'days' plus buffer for seed calculation
    // We fetch a bit more than 'days' to ensure CTL/ATL start somewhat accurately
    const activities = await getAthleteHistory(accessToken, days + 90)

    const timeSeries = calculatePerformanceTimeSeries(
      activities,
      days,
      preference,
      ftpHistoryResult,
    )

    return new Response(JSON.stringify(timeSeries), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('API Error:', error)
    return new Response('Failed to fetch history', { status: 500 })
  }
}
