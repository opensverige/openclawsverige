export type ProjectStatus = 'live' | 'wip' | 'idea';

export type Project = {
  id: string;
  slug: string;
  category: string;
  status: ProjectStatus;
  title: string;
  tagline: string;
  tags: string[];
  meta: Array<{ label: string; value: string | { text: string; href: string } }>;
  description: Array<{ label: string; body: string }>;
  links: Array<{ label: string; href: string; primary?: boolean }>;
};

export const PROJECTS: Project[] = [
  {
    id: '01',
    slug: 'agent-readiness-scanner',
    category: 'scanner',
    status: 'live',
    title: 'Agent Readiness Scanner',
    tagline: 'Hur agentredo är ditt bolag – på 3 minuter.',
    tags: ['Next.js', 'Claude API', 'svenska bolag'],
    meta: [
      { label: 'Live', value: { text: 'agent.opensverige.se', href: 'https://agent.opensverige.se' } },
      { label: 'Status', value: 'live' },
      { label: 'Stack', value: 'Next.js · Claude API · Vercel' },
    ],
    description: [
      {
        label: 'Vad det gör',
        body: 'Analyserar ett bolags digitala infrastruktur och returnerar en rapport om hur redo de är att ta emot AI-agenter. Kollar API-exponering, datakvalitet och processmognad.',
      },
      {
        label: 'Varför',
        body: 'Svenska bolag vet inte var de står. Konsultrapporter kostar 80k. Det här kostar ingenting och tar tre minuter.',
      },
      {
        label: 'Hur du bidrar',
        body: 'Fler branschspecifika frågor behövs. Öppna ett issue på GitHub eller föreslå en pull request.',
      },
    ],
    links: [
      { label: 'Öppna scanner →', href: 'https://agent.opensverige.se', primary: true },
      { label: 'GitHub →', href: 'https://github.com/opensverige/agent-opensverige' },
    ],
  },
  {
    id: '02',
    slug: 'gollum-testet',
    category: 'diagnostik',
    status: 'live',
    title: 'Gollum-testet',
    tagline: 'Hoardar du AI-idéer eller shippar du dem?',
    tags: ['quiz', 'community', 'viralitet'],
    meta: [
      { label: 'Live', value: { text: 'opensverige.se/gollum', href: 'https://opensverige.se/gollum' } },
      { label: 'Status', value: 'live' },
      { label: 'Stack', value: 'Next.js · CSS Modules' },
    ],
    description: [
      {
        label: 'Vad det gör',
        body: '5 frågor som diagnostiserar om du sitter fast i AI:ns dopaminloop utan att shippa. 4 möjliga resultat. Delbar badge. CTA till Discord.',
      },
      {
        label: 'Varför',
        body: 'Vi ser det i communityn: builders som loopar i Claude i månader utan att visa något. Det här gör mönstret synligt och pratbart.',
      },
      {
        label: 'Hur du bidrar',
        body: 'Fler frågor, fler resultattyper, översättning till engelska. Allt välkomnas.',
      },
    ],
    links: [
      { label: 'Ta testet →', href: 'https://opensverige.se/gollum', primary: true },
    ],
  },
  {
    id: '03',
    slug: 'nacken-guard',
    category: 'säkerhet',
    status: 'wip',
    title: 'NäckenGuard',
    tagline: 'PII-maskering för Fortnox-data via MCP.',
    tags: ['MCP', 'säkerhet', 'Fortnox', 'GDPR'],
    meta: [
      { label: 'Repo', value: { text: 'github.com/opensverige/nackensec', href: 'https://github.com/opensverige/nackensec' } },
      { label: 'Status', value: 'wip' },
      { label: 'Stack', value: 'Python · MCP · Fortnox API' },
    ],
    description: [
      {
        label: 'Vad det gör',
        body: 'Proxar Fortnox-anrop och maskar PII-fält (personnummer, bankuppgifter, adresser) innan datan når AI-agenten. GDPR-säkert by design.',
      },
      {
        label: 'Varför',
        body: 'Ingen borde behöva välja mellan AI-automatisering och dataskydd. NäckenGuard tar bort valet.',
      },
      {
        label: 'Hur du bidrar',
        body: 'Vi behöver fler fältdefinitioner för svenska dataformat och tester mot verkliga Fortnox-svar.',
      },
    ],
    links: [
      { label: 'GitHub →', href: 'https://github.com/opensverige/nackensec', primary: true },
    ],
  },
  {
    id: '04',
    slug: 'sidedoor-mcp',
    category: 'mcp',
    status: 'live',
    title: 'SideDoor MCP',
    tagline: 'MCP-server för dolda jobbmöjligheter på svenska arbetsmarknaden.',
    tags: ['MCP', 'Claude Desktop', 'jobb', 'Brave Search'],
    meta: [
      { label: 'Install', value: 'npm install -g @opensverige/sidedoor' },
      { label: 'Status', value: 'live' },
      { label: 'Stack', value: 'Node.js · MCP · Brave Search API' },
    ],
    description: [
      {
        label: 'Vad det gör',
        body: 'Kopplar Claude Desktop till Brave Search för att hitta dolda jobb på den svenska marknaden – positioner som aldrig läggs ut officiellt men syns i company-pages, Wayback och nischade sources.',
      },
      {
        label: 'Varför',
        body: 'Majoriteten av svenska jobb tillsätts aldrig via annons. Det här ger dig samma försprång som en välplacerad kontakt.',
      },
      {
        label: 'Hur du bidrar',
        body: 'Fler svenska jobboard-sources behövs. Öppna ett issue med källan så lägger vi till den.',
      },
    ],
    links: [
      { label: 'npm-paket →', href: 'https://www.npmjs.com/package/@opensverige/sidedoor', primary: true },
      { label: 'GitHub →', href: 'https://github.com/opensverige/sidedoor' },
    ],
  },
  {
    id: '05',
    slug: 'fortnox-skill',
    category: 'mcp',
    status: 'live',
    title: 'Fortnox Skill',
    tagline: 'Styr din Fortnox-fakturering direkt från chat.',
    tags: ['OpenClaw', 'Fortnox', 'fakturering', 'open source'],
    meta: [
      { label: 'Repo', value: { text: 'github.com/opensverige/fortnox-skill', href: 'https://github.com/opensverige/fortnox-skill' } },
      { label: 'Status', value: 'live' },
      { label: 'Stack', value: 'Python · OpenClaw · Fortnox API' },
    ],
    description: [
      {
        label: 'Vad det gör',
        body: 'OpenClaw-skill som låter dig lista fakturor, söka kunder och skapa enkla fakturor direkt från WhatsApp, Discord eller Telegram – utan att logga in i Fortnox.',
      },
      {
        label: 'Varför',
        body: 'Fortnox saknar bra mobil-UX. Det här löser det på ett sätt som passar svenska soloprenörer och småbolag.',
      },
      {
        label: 'Hur du bidrar',
        body: 'Fler Fortnox-endpoints behövs: betalningar, projekt, lager. Kika på issues.',
      },
    ],
    links: [
      { label: 'GitHub →', href: 'https://github.com/opensverige/fortnox-skill', primary: true },
    ],
  },
  {
    id: '06',
    slug: 'agentsmith-voice',
    category: 'bot',
    status: 'wip',
    title: 'AgentSmith Voice',
    tagline: 'Claude som Discord-röst. Pratar. Lyssnar. Svarar.',
    tags: ['Discord', 'Claude API', 'TTS', 'voice'],
    meta: [
      { label: 'Repo', value: { text: 'github.com/opensverige/agentsmith-voice', href: 'https://github.com/opensverige/agentsmith-voice' } },
      { label: 'Status', value: 'wip' },
      { label: 'Stack', value: 'Node.js · Claude API · Waves TTS · discord.js' },
    ],
    description: [
      {
        label: 'Vad det gör',
        body: 'Discord-bot som ansluter till röstkanaler och pratar med Claude i realtid. Text-to-speech via Waves. Kan sättas i olika personas beroende på kanal.',
      },
      {
        label: 'Varför',
        body: 'Builds på röst-AI är underrepresenterade i svenska communities. Det här är ett enkelt proof-of-concept att bygga vidare på.',
      },
      {
        label: 'Hur du bidrar',
        body: 'Behöver .env-setup och npm run register vid första körning. Se README. Pr:ar för fler personas välkomnas.',
      },
    ],
    links: [
      { label: 'GitHub →', href: 'https://github.com/opensverige/agentsmith-voice', primary: true },
    ],
  },
  {
    id: '07',
    slug: 'bakdorren',
    category: 'gate',
    status: 'wip',
    title: 'Bakdörren',
    tagline: 'AI-dörrvakt för communityt. Builders in. Hype ut.',
    tags: ['Claude API', 'Discord', 'community', 'gating'],
    meta: [
      { label: 'Repo', value: { text: 'github.com/opensverige/bunker-vakten', href: 'https://github.com/opensverige/bunker-vakten' } },
      { label: 'Status', value: 'wip' },
      { label: 'Stack', value: 'React · Claude API · Discord API' },
    ],
    description: [
      {
        label: 'Vad det gör',
        body: 'En AI-dörrvakt (Mr.NollInträde) som läser av om du är en faktisk builder eller spelar rollen. Specifika buggar och misslyckanden in. Generiska visioner ut.',
      },
      {
        label: 'Varför',
        body: 'Community-kvalitet degraderar med storlek om inget filter finns. Det här är ett experiment i hur man kan hålla signal hög utan att bli exkluderande.',
      },
      {
        label: 'Hur du bidrar',
        body: 'Prompt-engineering för dörrvakten är det som behöver mest jobb. Testa edge cases och öppna issues.',
      },
    ],
    links: [
      { label: 'GitHub →', href: 'https://github.com/opensverige/bunker-vakten', primary: true },
    ],
  },
  {
    id: '08',
    slug: 'agent-radar',
    category: 'meta',
    status: 'wip',
    title: 'AgentRadar',
    tagline: 'Automatisk jämförelsetabell för AI agent-ramverk. Noll manuellt underhåll.',
    tags: ['GitHub Actions', 'YAML', 'ramverk', 'öppen data'],
    meta: [
      { label: 'Repo', value: { text: 'github.com/opensverige/agent-radar', href: 'https://github.com/opensverige/agent-radar' } },
      { label: 'Status', value: 'wip' },
      { label: 'Stack', value: 'Node.js · GitHub Actions · GitHub API' },
    ],
    description: [
      {
        label: 'Vad det gör',
        body: 'Du definierar vilka ramverk som ska med (namn + GitHub-repo) – allt annat beräknas automatiskt. GitHub Actions kör enriching varje natt. Mognad, riskscore, best-for genereras utan manuell input.',
      },
      {
        label: 'Varför',
        body: 'Ramverkslandskapet förändras varje vecka. En statisk lista är inaktuell innan den är publicerad. Det här håller sig aktuell utan att kräva jobbet.',
      },
      {
        label: 'Hur du bidrar',
        body: 'Lägg till ramverk i frameworks.yaml, skicka en PR. Det är allt.',
      },
    ],
    links: [
      { label: 'GitHub →', href: 'https://github.com/opensverige/agent-radar', primary: true },
    ],
  },
];
