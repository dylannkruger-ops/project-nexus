import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';
import { routeTask } from './router.js';

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

const DECOMPOSER_SYSTEM = `You decompose complex tasks into parallel subtasks for a multi-agent AI system.

Available agent types:
- research: web research, fact-finding, competitive intel
- writer: long-form content, copywriting, scripts
- coder: code generation, debugging, architecture
- analyst: data analysis, financial modeling, reporting
- planner: strategy, roadmaps, OKRs, decomposition
- ops: workflow automation, integrations, SOPs
- critic: quality review, fact-checking, scoring
- synth: combining outputs, summaries, conflict resolution
- learner: lesson extraction, pattern recognition
- content: social media content creation
- publisher: posting to social platforms
- monitor: system health, alerts

Respond ONLY with valid JSON array. Each subtask:
{
  "id": "unique-id",
  "description": "Clear task for one agent",
  "agentType": "one of the types above",
  "priority": 1-5 (1=highest),
  "dependsOn": ["subtask-id"] or [],
  "estimatedMinutes": 1-30
}

Guidelines:
- Simple tasks: 1-2 subtasks
- Complex tasks: 3-6 subtasks max in parallel workstreams
- End with synth subtask depending on main subtasks if multiple
- Add critic subtask for quality-sensitive output`;

export async function decompose(task) {
  try {
    const res = await client.messages.create({
      model: config.agents.model,
      max_tokens: 2048,
      system: DECOMPOSER_SYSTEM,
      messages: [{ role: 'user', content: `Decompose this task: ${task}` }],
    });

    const jsonMatch = res.content[0].text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array in response');
    const subtasks = JSON.parse(jsonMatch[0]);
    return subtasks.map(s => ({ ...s, id: s.id || uuidv4() }));
  } catch (err) {
    console.warn('[DECOMPOSER] Falling back to single task:', err.message);
    return [
      {
        id: uuidv4(),
        description: task,
        agentType: routeTask(task),
        priority: 1,
        dependsOn: [],
        estimatedMinutes: 5,
      },
    ];
  }
}
