import { NextResponse } from 'next/server'
import { getRedis, GOLLUM_KEY } from '@/lib/redis'

export async function GET() {
  try {
    const redis = await getRedis()
    const count = await redis.get(GOLLUM_KEY)
    return NextResponse.json({ count: Number(count ?? 0) })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}

export async function POST() {
  try {
    const redis = await getRedis()
    const count = await redis.incr(GOLLUM_KEY)
    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
