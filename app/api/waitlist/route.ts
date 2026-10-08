import { NextRequest, NextResponse } from 'next/server'
import { getPublicBackendBaseUrl } from '@/lib/serverBackendApi'

const GENERIC_ERROR = 'Failed to join waitlist. Please try again.'

// The playbook step waits on the backend while BrutusAI writes a sample message for the business
// (up to 30 s) and the PDF is built. Allow the function a full minute so it isn't cut off first.
export const maxDuration = 60

function parseJson(text: string): Record<string, unknown> | null {
  if (!text) return null
  try {
    const parsed: unknown = JSON.parse(text)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name, email, phone, businessName, location, industry, activity,
      biggestProblem, audienceSize, extraContext,
    } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const base = getPublicBackendBaseUrl(request)
    const res = await fetch(`${base}/v1/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, email, phone, businessName, location, industry, activity,
        biggestProblem, audienceSize, extraContext,
      }),
    })
    const text = await res.text()
    const data = parseJson(text)
    if (!res.ok) {
      // The backend may answer with a non-JSON body (a proxy 404, an HTML error page);
      // never let that turn into a 500 from this route.
      console.error('Waitlist upstream error', res.status, text.slice(0, 200))
      const upstreamMessage =
        typeof data?.error === 'string' ? data.error
        : typeof data?.message === 'string' ? data.message
        : null
      const message = res.status < 500 && upstreamMessage ? upstreamMessage : GENERIC_ERROR
      return NextResponse.json({ error: message }, { status: res.status >= 500 || res.status === 404 ? 502 : res.status })
    }

    return NextResponse.json(
      {
        message: 'Successfully joined the waitlist!',
        data: {
          id: data?.id,
          name: data?.name ?? name,
          email: data?.email ?? email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating waitlist entry:', error)
    return NextResponse.json(
      { error: GENERIC_ERROR },
      { status: 500 }
    )
  }
}
