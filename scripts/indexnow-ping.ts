/**
 * IndexNow ping — notifierar Bing, Yandex, Naver och Seznam om uppdaterade URLs.
 *
 * Användning:
 *   npx tsx scripts/indexnow-ping.ts            # pingar alla URLs i sitemap
 *   npx tsx scripts/indexnow-ping.ts /blogg/x   # pingar enskild path
 *
 * Key måste matcha filen i public/<key>.txt och returnera key som ren text.
 * Bing dokumentation: https://www.bing.com/indexnow
 */

const HOST = 'opensverige.se'
const KEY = 'a7f93e2b4c1d8506f912a3b4c5d6e7f8'
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`
const ENDPOINT = 'https://api.indexnow.org/IndexNow'

interface IndexNowBody {
  host: string
  key: string
  keyLocation: string
  urlList: string[]
}

async function fetchSitemapUrls(): Promise<string[]> {
  const res = await fetch(`https://${HOST}/sitemap.xml`, {
    headers: { 'User-Agent': 'opensverige-indexnow-ping/1.0' },
  })
  if (!res.ok) {
    throw new Error(`Kunde inte hämta sitemap: HTTP ${res.status}`)
  }
  const xml = await res.text()
  const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map(
    (match) => match[1],
  )
  if (urls.length === 0) {
    throw new Error('Ingen <loc> hittades i sitemap.xml')
  }
  return urls
}

async function pingIndexNow(urls: string[]): Promise<void> {
  const body: IndexNowBody = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  }

  console.log(`Pingar IndexNow med ${urls.length} URLs:`)
  for (const url of urls) console.log(`  → ${url}`)

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'User-Agent': 'opensverige-indexnow-ping/1.0',
    },
    body: JSON.stringify(body),
  })

  const responseBody = await res.text()
  if (res.status >= 200 && res.status < 300) {
    console.log(`\nOK — IndexNow svarade ${res.status} (${responseBody || 'tomt svar'})`)
    return
  }
  console.error(`\nFEL — IndexNow svarade ${res.status}: ${responseBody}`)
  process.exit(1)
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const urls = args.length
    ? args.map((path) =>
        path.startsWith('http') ? path : `https://${HOST}${path.startsWith('/') ? path : `/${path}`}`,
      )
    : await fetchSitemapUrls()

  await pingIndexNow(urls)
}

main().catch((err) => {
  console.error('Fel:', err)
  process.exit(1)
})
