const ROUTING_RULES = [
  { pattern: /\b(research|find|search|investigate|look up|discover|what is|who is|how does|how to)/i, type: 'research' },
  { pattern: /\b(write|draft|create content|generate text|blog|email|copy|article|script|caption|post text|hook)/i, type: 'writer' },
  { pattern: /\b(code|program|implement|debug|function|class|script|api|database schema|sql|fix the bug|build|develop)/i, type: 'coder' },
  { pattern: /\b(analyze|analyse|data|report|metrics|kpi|financial|model|forecast|trend|insight)/i, type: 'analyst' },
  { pattern: /\b(plan|strategy|roadmap|goal|okr|milestone|timeline|prioritize|schedule)/i, type: 'planner' },
  { pattern: /\b(automate|integrate|workflow|process|sop|operations|connect|trigger)/i, type: 'ops' },
  { pattern: /\b(review|critique|check quality|score|evaluate|is this good|improve this|verify)/i, type: 'critic' },
  { pattern: /\b(summarize|combine|synthesize|merge|consolidate|executive summary)/i, type: 'synth' },
  { pattern: /\b(learn|what worked|lessons|pattern|knowledge|extract|distill)/i, type: 'learner' },
  { pattern: /\b(content for|social media|tiktok|instagram|youtube|video idea|reel|short)/i, type: 'content' },
  { pattern: /\b(publish|post to|schedule post|auto-post|share to)/i, type: 'publisher' },
  { pattern: /\b(monitor|watch|alert|health check|uptime|anomaly)/i, type: 'monitor' },
];

export function routeTask(taskDescription) {
  for (const rule of ROUTING_RULES) {
    if (rule.pattern.test(taskDescription)) return rule.type;
  }
  return 'research';
}

export function routeMultiple(taskDescription) {
  const matched = new Set();
  for (const rule of ROUTING_RULES) {
    if (rule.pattern.test(taskDescription)) matched.add(rule.type);
    if (matched.size >= 4) break;
  }
  return matched.size > 0 ? [...matched] : ['research'];
}
