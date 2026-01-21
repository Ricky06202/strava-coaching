import type { APIRoute } from 'astro'
import { getDb } from '@/db'
import { athletes } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const GET: APIRoute = async ({ url, redirect, locals }) => {
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) {
    return new Response(`Error: ${error}`, { status: 400 })
  }

  if (!code) {
    return new Response('Missing code', { status: 400 })
  }

  try {
    const runtime = (locals as any).runtime
    const clientId =
      import.meta.env.STRAVA_CLIENT_ID || runtime?.env?.STRAVA_CLIENT_ID
    const clientSecret =
      import.meta.env.STRAVA_CLIENT_SECRET || runtime?.env?.STRAVA_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error('Missing Strava credentials')
    }

    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to exchange token')
    }

    const { access_token, refresh_token, expires_at, athlete } = data

    // Get DB instance from Cloudflare runtime
    const db = getDb((locals as any).runtime.env)

    // Save or update athlete in DB
    await db
      .insert(athletes)
      .values({
        id: athlete.id,
        firstname: athlete.firstname,
        lastname: athlete.lastname,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expires_at,
      })
      .onConflictDoUpdate({
        target: athletes.id,
        set: {
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt: expires_at,
        },
      })

    // In a real app, you might want to show a success page
    return redirect('/?auth=success')
  } catch (err) {
    console.error('Auth Error:', err)
    return new Response('Internal Server Error while authenticating', {
      status: 500,
    })
  }
}
