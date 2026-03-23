import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { RESULTS } from '../_lib/quiz-data'
import type { Lang, ResultSlug } from '../_lib/types'

export const runtime = 'edge'

const VALID_SLUGS: ResultSlug[] = ['gollum', 'dreambuilder', 'speedrunner', 'shipper']

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('r') as ResultSlug
  const size = searchParams.get('size') === 'square' ? 'square' : 'og'
  const lang: Lang = searchParams.get('lang') === 'en' ? 'en' : 'sv'

  if (!VALID_SLUGS.includes(slug)) {
    return new Response('Invalid result slug', { status: 400 })
  }

  const result = RESULTS[slug]
  const cardWidth  = size === 'square' ? 1080 : 1200
  const cardHeight = size === 'square' ? 1350 :  630
  const imageHeight = size === 'square' ? 810 : 370
  const panelHeight = cardHeight - imageHeight

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0a0806',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'serif',
          overflow: 'hidden',
        }}
      >
        {/* Full-bleed image */}
        <img
          src={`${new URL(req.url).origin}/gollum/${slug}.jpg`}
          width={cardWidth}
          height={imageHeight}
          style={{ objectFit: 'cover', objectPosition: 'center top', display: 'block', flexShrink: 0 }}
        />

        {/* Dark text panel */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: size === 'square' ? '52px 60px 44px' : '28px 56px 32px',
            height: panelHeight,
            flexShrink: 0,
          }}
        >
          {/* Title + headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: size === 'square' ? 18 : 10 }}>
            <div style={{ fontSize: size === 'square' ? 88 : 52, color: '#e8e0d4', lineHeight: 1.05, display: 'flex' }}>
              {result.name[lang]}
            </div>
            <div style={{ fontSize: size === 'square' ? 30 : 22, color: '#9a9188', lineHeight: 1.5, display: 'flex' }}>
              {result.headline[lang]}
            </div>
          </div>

          {/* Footer line */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: size === 'square' ? 22 : 16, color: '#c9a55a', display: 'flex' }}>
              opensverige
            </div>
            <div style={{ fontSize: size === 'square' ? 18 : 13, color: '#4a4540', display: 'flex', fontFamily: 'monospace' }}>
              opensverige.se/gollum
            </div>
          </div>
        </div>
      </div>
    ),
    { width: cardWidth, height: cardHeight }
  )
}
