// lib/check-context.ts
import type { CheckId } from './checks';

export interface CheckContext {
  stat: string;
  source: string;
  action: string;
}

export const CHECK_CONTEXT: Record<CheckId, CheckContext> = {
  robots_ok: {
    stat: "83% av företag planerar att deploya AI-agenter. Din robots.txt avgör om de kan nå dig.",
    source: "Cisco AI Readiness Index 2025",
    action: "Se till att robots.txt inte blockerar AI-agenter som GPTBot och ClaudeBot.",
  },
  sitemap_exists: {
    stat: "AI-agenter navigerar sajter via sitemap — utan den missar de ditt innehåll.",
    source: "Postman, The 90-day AI Readiness Playbook",
    action: "Lägg till sitemap.xml så agenter kan navigera din sajt.",
  },
  llms_txt: {
    stat: "AI-system förlitar sig på strukturerad metadata och maskinläsbar dokumentation. Utan llms.txt vet agenter inte vad du erbjuder.",
    source: "Postman, The 90-day AI Readiness Playbook",
    action: "Lägg till /llms.txt som beskriver ditt API och dina tjänster för AI-agenter.",
  },
  privacy_automation: {
    stat: "92% av organisationer saknar full visibilitet över sina AI-identiteter. Bara 16% styr åtkomsten effektivt.",
    source: "Gravitee, The AI Agent Governance Gap 2026",
    action: "Uppdatera integritetspolicyn med info om automatiserad behandling (GDPR Art. 22).",
  },
  cookie_bot_handling: {
    stat: "86% av företag tillämpar inte åtkomstpolicies för AI-identiteter alls. Consent-banners är byggda för människor.",
    source: "Gravitee, The AI Agent Governance Gap 2026",
    action: "Se över hur din cookielösning hanterar icke-mänskliga besökare.",
  },
  ai_content_marking: {
    stat: "EU AI Act Art. 50(2) kräver maskinläsbar märkning av AI-genererat innehåll. Träder i kraft aug 2026.",
    source: "EU AI Act",
    action: "Förbered för EU AI Act — märk AI-genererat innehåll maskinläsbart (Art. 50).",
  },
  api_exists: {
    stat: "Bara 13% av företag är fullt redo för AI. De som har publika API:er ligger före.",
    source: "Cisco AI Readiness Index 2025",
    action: "Skapa ett publikt API — utan det kan ingen agent interagera med ditt system.",
  },
  openapi_spec: {
    stat: "AI-agenter kan inte använda ett API utan maskinläsbar spec. 58% av utvecklare förlitar sig på intern dokumentation.",
    source: "Postman, State of API Report 2024",
    action: "Publicera en OpenAPI-spec så agenter och builders kan mappa ditt API automatiskt.",
  },
  api_docs: {
    stat: "Utan dokumentation kan ingen builder bygga mot ditt system. Det är den första barriären.",
    source: "Postman, The 90-day AI Readiness Playbook",
    action: "Publicera API-dokumentation — utan docs kan ingen bygga mot ditt system.",
  },
  mcp_server: {
    stat: "MCP standardiserar hur AI kopplas till verktyg. 75% av organisationer har redan hittat osanktionerade AI-verktyg i sina miljöer.",
    source: "Gravitee, The AI Agent Governance Gap 2026",
    action: "Publicera en MCP-server så att AI-agenter kan koppla in sig direkt i ditt system.",
  },
  sandbox_available: {
    stat: "Utan testmiljö bygger ingen agent-utvecklare mot ditt system på allvar.",
    source: "Postman, The 90-day AI Readiness Playbook",
    action: "Erbjud en sandbox/testmiljö så builders kan testa utan att påverka produktionsdata.",
  },
};
