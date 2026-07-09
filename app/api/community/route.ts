import { NextResponse } from 'next/server'

const COMMUNITY_DATA = {
  name: 'opensverige',
  description: 'Sveriges öppna community för AI-agenter',
  url: 'https://opensverige.se',
  discord: 'https://discord.gg/ZbV4qB34um',
  github: 'https://github.com/opensverige',
  stats: {
    members: 250,
    projects: 7,
    cities: ['Stockholm', 'Göteborg', 'Malmö'],
    founded: '2026-01',
  },
  showcase: [
    {
      name: 'FAVER',
      status: 'live',
      url: 'https://faver-one.vercel.app/map',
      tags: ['matpris', 'gps', 'realtime'],
    },
    {
      name: 'Agent Readiness Scanner',
      status: 'live',
      url: 'https://agent.opensverige.se',
      tags: ['scanner', 'agentredo', 'seo'],
    },
    {
      name: 'AI-Infra',
      status: 'live',
      url: 'https://infra.opensverige.se',
      tags: ['jämförelse', 'datasuveränitet', 'gdpr'],
    },
    {
      name: 'grunden.ai',
      status: 'live',
      url: 'https://grunden.ai',
      tags: ['ai-infra', 'llm-api', 'eu'],
    },
    {
      name: 'Agent Arena',
      status: 'live',
      url: 'https://battle.opensverige.se',
      tags: ['arena', 'multi-agent', 'leaderboard'],
    },
    {
      name: 'LunarAIstorm',
      status: 'live',
      url: 'https://lunaraistorm.se',
      tags: ['multi-agent', 'open-source'],
    },
    {
      name: 'Gollum-testet',
      status: 'live',
      url: 'https://opensverige.se/gollum',
      tags: ['quiz', 'ai-sycophancy'],
    },
  ],
} as const

export async function GET() {
  return NextResponse.json(COMMUNITY_DATA, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
