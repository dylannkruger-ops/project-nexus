import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';

export class BaseAgent {
  constructor(type, agentConfig, memoryManager) {
    this.type = type;
    this.config = agentConfig;
    this.memory = memoryManager;
    this.client = new Anthropic({ apiKey: config.anthropic.apiKey });
    this.busy = false;
    this.taskCount = 0;
  }

  getSystemPrompt(task, contextPacket) {
    return `You are a ${this.type} agent in the KRONOS autonomous AI system.

Your role: ${this.config.role}

Your capabilities:
${this.config.capabilities.map(c => `- ${c}`).join('\n')}

${contextPacket ? '## CONTEXT FROM MEMORY\n' + contextPacket + '\n\n' : ''}

## YOUR OUTPUT FORMAT
Always respond with valid JSON in this exact structure:
{
  "result": "<main result — text, code, analysis, plan, etc.>",
  "summary": "<1-2 sentence summary>",
  "confidence": <0.0-1.0>,
  "thoughtProcess": "<brief explanation of your approach>",
  "tags": ["<relevant tag>"],
  "followupNeeded": <true|false>
}

Be thorough, accurate, and maximally helpful. Quality matters — your outputs are scored and used to improve future agents.`;
  }

  async callClaude(messages, systemPrompt, retries = 0) {
    try {
      const res = await this.client.messages.create({
        model: config.agents.model,
        max_tokens: config.agents.maxTokens,
        system: systemPrompt,
        messages,
      });
      return res.content[0].text;
    } catch (err) {
      if (retries < 3 && (err.status === 529 || err.status === 429 || err.status === 503)) {
        const delay = Math.pow(2, retries) * 2000;
        console.log(`[${this.type}] Retry ${retries + 1} after ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
        return this.callClaude(messages, systemPrompt, retries + 1);
      }
      throw err;
    }
  }

  parseResponse(raw) {
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch {}
    return {
      result: raw,
      summary: raw.slice(0, 150),
      confidence: 0.6,
      thoughtProcess: '',
      tags: [],
      followupNeeded: false,
    };
  }

  async run(taskInput, taskId, taskType) {
    this.busy = true;
    this.taskCount++;
    const startTime = Date.now();

    try {
      const contextPacket = await this.memory.buildContextPacket(this.type, taskInput, taskType);
      const systemPrompt = this.getSystemPrompt(taskInput, contextPacket);
      const raw = await this.callClaude(
        [{ role: 'user', content: taskInput }],
        systemPrompt
      );
      const parsed = this.parseResponse(raw);
      const duration = Date.now() - startTime;

      await this.memory.remember(
        `Task: ${taskInput.slice(0, 200)}\nResult: ${(parsed.result || '').toString().slice(0, 400)}\nSummary: ${parsed.summary}`,
        { agentType: this.type, taskType, taskId, outcome: 'success' }
      );

      return { ...parsed, agentType: this.type, taskId, durationMs: duration };
    } catch (err) {
      console.error(`[${this.type}] Task ${taskId} failed:`, err.message);
      throw err;
    } finally {
      this.busy = false;
    }
  }
}
