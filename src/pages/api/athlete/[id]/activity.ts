import type { APIRoute } from 'astro'
import { getValidAccessToken, getLatestActivity } from '@/lib/strava'

export const GET: APIRoute = async ({ params, locals }) => {
  const { id } = params
  if (!id) {
    return new Response('Missing athlete ID', { status: 400 })
  }

  try {
    const env = (locals as any).runtime.env
    const accessToken = await getValidAccessToken(parseInt(id), env)
    const activity = await getLatestActivity(accessToken)

    return new Response(JSON.stringify(activity), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('API Error:', error)
    return new Response('Failed to fetch activity', { status: 500 })
  }
}
