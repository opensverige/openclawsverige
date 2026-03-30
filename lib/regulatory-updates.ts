// lib/regulatory-updates.ts
// Update this file manually when regulatory changes occur. Max 3 entries shown in UI.

export type RegulatoryUpdateSeverity = 'important' | 'info';

export interface RegulatoryUpdate {
  date: string;         // YYYY-MM-DD
  text: string;
  severity: RegulatoryUpdateSeverity;
}

export const REGULATORY_UPDATES: RegulatoryUpdate[] = [
  {
    date: "2026-03-30",
    text: "EU AI Act Art. 50 — krav på märkning av AI-genererat innehåll träder i kraft aug 2026.",
    severity: "important",
  },
  {
    date: "2026-03-15",
    text: "GDPR-vägledning från EDPB om AI-agenter som personuppgiftsbiträden — förväntas Q2 2026.",
    severity: "info",
  },
];
