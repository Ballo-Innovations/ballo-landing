import { NextRequest, NextResponse } from 'next/server'
import { getPublicBackendBaseUrl } from '@/lib/serverBackendApi'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone } = body

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
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
      body: JSON.stringify({ name, email, phone }),
    })
    const text = await res.text()
    const data = text ? JSON.parse(text) : null
    if (!res.ok) {
      const message = data?.error || data?.message || 'Failed to join waitlist. Please try again.'
      return NextResponse.json({ error: message }, { status: res.status })
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
      { error: 'Failed to join waitlist. Please try again.' },
      { status: 500 }
    )
  }
}
