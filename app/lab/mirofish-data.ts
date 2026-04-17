export type MiroFishPrediction = {
  id: string;
  headline: string;
  prediction: string;
  subject: string;
  event: string;
  verdict: string;
  confidence: 'hög' | 'medel' | 'låg';
  publishedAt: string;
  resolvesAt: string;
  methodSummary: string;
  seedFileCount: number;
  reportUrl: string;
  methodUrl: string;
  status: 'pågående' | 'verifierad' | 'fel';
};

export const MIROFISH_PREDICTIONS: MiroFishPrediction[] = [
  {
    id: 'lib-2026-riksdag',
    headline: 'Liberalerna faller under riksdagsspärren',
    prediction: '2,1–2,2%',
    subject: 'Liberalerna',
    event: 'Riksdagsvalet 13 september 2026',
    verdict: 'Under 4%-spärren · 190 000 röster försvinner · Tidö förlorar ett regeringsben',
    confidence: 'hög',
    publishedAt: '2026-04-17',
    resolvesAt: '2026-09-13',
    methodSummary: 'Miro-Fish multi-agent simulering · OpenAI · 100 agenter · 30 rundor',
    seedFileCount: 0,
    reportUrl: 'https://github.com/opensverige',
    methodUrl: 'https://github.com/opensverige',
    status: 'pågående',
  },
];
