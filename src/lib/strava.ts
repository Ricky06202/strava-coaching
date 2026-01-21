import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { athletes } from '@/db/schema'

export async function getValidAccessToken(athleteId: number, env: any) {
  const db = getDb(env)
  const result = await db
    .select()
    .from(athletes)
    .where(eq(athletes.id, athleteId))
    .limit(1)
  const athlete = result[0]

  if (!athlete) {
    throw new Error('Athlete not found')
  }

  // Check if token is expired (or about to expire in next 5 min)
  const now = Math.floor(Date.now() / 1000)
  if (athlete.expiresAt && athlete.expiresAt < now + 300) {
    console.log('Refreshing token for athlete:', athleteId)
    // Refresh token
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.STRAVA_CLIENT_ID || import.meta.env.STRAVA_CLIENT_ID,
        client_secret:
          env.STRAVA_CLIENT_SECRET || import.meta.env.STRAVA_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: athlete.refreshToken,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to refresh token:', error)
      throw new Error('Failed to refresh Strava token')
    }

    const data = await response.json()

    // Update DB
    await db
      .update(athletes)
      .set({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at,
      })
      .where(eq(athletes.id, athleteId))

    return data.access_token
  }

  return athlete.accessToken
}

export async function getAthleteHistory(accessToken: string) {
  // Get date 60 days ago
  const dateOffset = new Date()
  dateOffset.setDate(dateOffset.getDate() - 60)
  const after = Math.floor(dateOffset.getTime() / 1000)

  const response = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=200`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error('Failed to fetch activities')
  }

  const activities = await response.json()
  return activities
}

export function calculatePerformanceMetrics(
  activities: any[],
  metricPreference: 'heart_rate' | 'power' = 'heart_rate',
  ftpHistory: { ftp: number; date: string }[] = [],
) {
  // Sort by date ascending
  const sortedActivities = activities.sort(
    (a: any, b: any) =>
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
  )

  let ctl = 0 // Fitness (42 days)
  const ctlTimeConstant = 42
  let atl = 0 // Fatigue (7 days)
  const atlTimeConstant = 7

  // Simple TSS estimation if not present (Relative Effort or Heart Rate based)
  // Fallback: (Moving Time / 3600) * 50 (Assume moderate intensity of 50 TSS/hr if no data)
  const getLoad = (act: any) => {
    if (
      metricPreference === 'power' &&
      (act.device_watts || act.has_weighted_average_power)
    ) {
      // TSS = (sec * NP * IF) / (FTP * 3600) * 100
      // NP = weighted_average_watts (Normalized Power)
      // IF = NP / FTP
      // Find FTP for this activity date
      const activityDate = new Date(act.start_date).toISOString().split('T')[0]
      const sortedHistory = [...ftpHistory].sort((a, b) =>
        b.date.localeCompare(a.date),
      )
      const athleteFtp =
        sortedHistory.find((h) => h.date <= activityDate)?.ftp || 200

      const np = act.weighted_average_watts || act.average_watts || 0
      const intensityFactor = np / athleteFtp
      const tss = (act.moving_time * np * intensityFactor) / (athleteFtp * 36)
      return Math.round(tss)
    }

    // Suffer Score is Strava's Relative Effort (Heart Rate based)
    if (act.suffer_score) return act.suffer_score
    // Fallback estimation
    const hours = act.moving_time / 3600
    return hours * 50
  }

  // Iterate through all activities to build up the moving average
  // In a real pro app, we would fill in "zero" days.
  // For this MVP, we'll approximate by iterating through activities.

  if (sortedActivities.length === 0) return { ctl: 0, atl: 0, tsb: 0 }

  // Initial Seed
  ctl = getLoad(sortedActivities[0])
  atl = ctl

  for (let i = 1; i < sortedActivities.length; i++) {
    const load = getLoad(sortedActivities[i])
    // EWMA Formula: Today = Yesterday + (Load - Yesterday) * (1 / TimeConstant)
    ctl = ctl + (load - ctl) * (1 / ctlTimeConstant)
    atl = atl + (load - atl) * (1 / atlTimeConstant)
  }

  return {
    ctl: Math.round(ctl),
    atl: Math.round(atl),
    tsb: Math.round(ctl - atl), // Form = Fitness - Fatigue
    lastActivityDate: sortedActivities[sortedActivities.length - 1].start_date,
    activityCount: sortedActivities.length,
  }
}

export async function getLatestActivity(accessToken: string) {
  const response = await fetch(
    'https://www.strava.com/api/v3/athlete/activities?per_page=1',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error('Failed to fetch activities')
  }

  const activities = await response.json()
  return activities[0] || null
}
