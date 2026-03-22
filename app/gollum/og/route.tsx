import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { RESULTS } from '../_lib/quiz-data'
import type { ResultSlug } from '../_lib/types'

export const runtime = 'edge'

const VALID_SLUGS: ResultSlug[] = ['gollum', 'dreambuilder', 'speedrunner', 'shipper']

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('r') as ResultSlug
  const size = searchParams.get('size') === 'square' ? 'square' : 'og'

  if (!VALID_SLUGS.includes(slug)) {
    return new Response('Invalid result slug', { status: 400 })
  }

  const result = RESULTS[slug]
  const width  = size === 'square' ? 1080 : 1200
  const height = size === 'square' ? 1080 :  630

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#060606',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Logo top-left */}
        <div style={{ position: 'absolute', top: 32, left: 48, fontSize: 20, color: '#c9a55a', display: 'flex' }}>
          opensverige
        </div>

        {/* URL bottom-right */}
        <div style={{ position: 'absolute', bottom: 32, right: 48, fontSize: 16, color: '#4a4540', display: 'flex', fontFamily: 'monospace' }}>
          opensverige.se/gollum
        </div>

        {/* Image placeholder — solid rect until artwork is ready */}
        <div style={{
          width: size === 'square' ? 320 : 200,
          height: size === 'square' ? 320 : 200,
          background: '#1a1a1a',
          borderRadius: 16,
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 80,
        }}>
          {result.emoji}
        </div>

        {/* Result name */}
        <div style={{ fontSize: size === 'square' ? 72 : 56, color: '#e8e0d4', marginBottom: 16, display: 'flex' }}>
          {result.name.sv}
        </div>

        {/* Headline */}
        <div style={{
          fontSize: 24,
          color: '#b0a89e',
          textAlign: 'center',
          maxWidth: 700,
          lineHeight: 1.4,
          display: 'flex',
        }}>
          {result.headline.sv}
        </div>
      </div>
    ),
    { width, height }
  )
}
