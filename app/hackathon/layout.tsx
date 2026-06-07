import type { Metadata } from 'next'
import { pixelDisplay, vt323 } from './fonts'
import styles from './hackathon.module.css'

export const metadata: Metadata = {
  title: 'Spel-Hackathon — OpenSverige',
  description:
    'Open Sverige Spel-Hackathon: skapa ett litet spel på en vecka. Valfri genre och teknik, spelbart räcker. Community + jury, öppen kod väger extra.',
  openGraph: {
    title: 'Open Sverige · Spel-Hackathon',
    description:
      'Skapa ett litet spel på en vecka. Community + jury, öppen kod väger extra. Kom med din idé.',
  },
}

// Egen stilguide för /hackathon — pixel/8-bit, helt skild från resten av sajten.
// Ingen global Nav. Egna fonts och palett scopas till .shell.
export default function HackathonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${pixelDisplay.variable} ${vt323.variable} ${styles.shell}`}>
      {children}
    </div>
  )
}
