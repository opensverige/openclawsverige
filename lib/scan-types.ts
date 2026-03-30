// lib/scan-types.ts
import type { AllChecks, ScanBadge } from './checks';

export interface AgentSuggestion {
  name: string;
  description: string;
  relevance: string;
}

export interface ScanResult {
  company: string;
  industry: string;
  summary: string;
  agent_suggestions: AgentSuggestion[];
  badge: ScanBadge;
  score: number;
  checks: AllChecks;
  recommendations: string[];
  severity_counts: { critical: number; important: number; info: number };
  scan_id: string | null;
  isDemo: boolean;
}

export const DEFAULT_AGENT_SUGGESTIONS: AgentSuggestion[] = [
  {
    name: "Kundtjänst-agent",
    description: "Svarar på ärenden genom att koppla ihop CRM, mail och docs.",
    relevance: "Vanlig agent-typ som fungerar för de flesta verksamheter.",
  },
  {
    name: "Compliance-agent",
    description: "Övervakar GDPR och EU AI Act-krav automatiskt.",
    relevance: "Relevant för alla svenska företag inför EU AI Act aug 2026.",
  },
  {
    name: "Data-agent",
    description: "Samlar och sammanställer data från era system.",
    relevance: "Grundläggande automatisering för alla verksamheter.",
  },
];
