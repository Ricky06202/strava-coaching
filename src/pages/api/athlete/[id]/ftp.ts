import type { APIRoute } from 'astro'
import { getDb } from '@/db'
import { ftpHistory } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export const POST: APIRoute = async ({ params, request, locals }) => {
  const { id } = params
  if (!id) return new Response('Missing athlete ID', { status: 400 })

  try {
    const { ftp, date } = await request.json()
    const env = (locals as any).runtime.env
    const db = getDb(env)

    await db.insert(ftpHistory).values({
      athleteId: parseInt(id),
      ftp: parseInt(ftp),
      date,
    })

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('API Error:', error)
    return new Response('Failed to add FTP entry', { status: 500 })
  }
}

export const DELETE: APIRoute = async ({ params, request, locals }) => {
  const { id } = params
  if (!id) return new Response('Missing athlete ID', { status: 400 })

  try {
    const { date } = await request.json()
    const env = (locals as any).runtime.env
    const db = getDb(env)

    await db
      .delete(ftpHistory)
      .where(
        and(eq(ftpHistory.athleteId, parseInt(id)), eq(ftpHistory.date, date)),
      )

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('API Error:', error)
    return new Response('Failed to delete FTP entry', { status: 500 })
  }
}
