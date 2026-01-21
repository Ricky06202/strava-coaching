import type { APIRoute } from 'astro'
import { getDb } from '@/db'
import { athletes } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const { id } = params
  if (!id) {
    return new Response('Missing athlete ID', { status: 400 })
  }

  try {
    const { metricPreference, ftp } = await request.json()
    const env = (locals as any).runtime.env
    const db = getDb(env)

    await db
      .update(athletes)
      .set({
        metricPreference,
      })
      .where(eq(athletes.id, parseInt(id)))

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('API Error:', error)
    return new Response('Failed to update preferences', { status: 500 })
  }
}
