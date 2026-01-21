import type { APIRoute } from 'astro'
import {
  getValidAccessToken,
  getAthleteHistory,
  calculatePerformanceMetrics,
} from '@/lib/strava'

export const GET: APIRoute = async ({ params, locals }) => {
  const { id } = params
  if (!id) {
    return new Response('Missing athlete ID', { status: 400 })
  }

  try {
    const env = (locals as any).runtime.env
    const accessToken = await getValidAccessToken(parseInt(id), env)

    // Fetch historical data (last 60 days)
    const activities = await getAthleteHistory(accessToken)

    // Calculate metrics
    const metrics = calculatePerformanceMetrics(activities)

    return new Response(JSON.stringify(metrics), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('API Error:', error)
    return new Response('Failed to calculate metrics', { status: 500 })
  }
}
