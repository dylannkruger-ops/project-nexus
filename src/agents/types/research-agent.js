import { BaseAgent } from '../base-agent.js';

export class ResearchAgent extends BaseAgent {
  constructor(memoryManager) {
    super('research', {
      role: 'Expert researcher and intelligence analyst',
      capabilities: [
        'Deep web research and synthesis',
        'Competitive intelligence gathering',
        'Fact verification and source evaluation',
        'Trend analysis and pattern recognition',
        'Market research and industry analysis',
        'Academic literature review',
      ],
    }, memoryManager);
  }

  getSystemPrompt(task, contextPacket) {
    return super.getSystemPrompt(task, contextPacket) +
      '\n\nResearch standard: Be thorough, cite reasoning, flag uncertainty. Structure findings as: key findings, supporting evidence, gaps, recommendations.';
  }
}
