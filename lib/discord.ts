const GUILD_ID = '1466847548864987289'
const WIDGET_URL = `https://discord.com/api/guilds/${GUILD_ID}/widget.json`

export interface DiscordData {
  online: number
  channels: number
}

export async function getDiscordData(): Promise<DiscordData | null> {
  try {
    const res = await fetch(WIDGET_URL, {
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error(`Discord ${res.status}`)
    const data = await res.json()
    return {
      online: data.presence_count ?? 0,
      channels: data.channels?.length ?? 0,
    }
  } catch {
    return null
  }
}
