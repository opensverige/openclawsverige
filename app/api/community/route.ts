import { NextResponse } from 'next/server'

const COMMUNITY_DATA = {
  name: 'opensverige',
  description: 'Sveriges öppna community för AI-agenter',
  url: 'https://opensverige.se',
  discord: 'https://discord.gg/CSphbTk8En',
  github: 'https://github.com/opensverige',
  stats: {
    members: 250,
    projects: 5,
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
      name: 'fortnox-skill',
      status: 'open-source',
      url: 'https://github.com/opensverige/fortnox-skill',
      tags: ['openclaw', 'fortnox', 'mcp'],
    },
    {
      name: 'Kammaren',
      status: 'live',
      url: 'https://kammaren.nu',
      tags: ['skatteoptimering', '3:12', 'sovereign-ai'],
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
