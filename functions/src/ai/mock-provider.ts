import type { TaskDraftFields } from '@team517/contracts';
import type { AiProvider, StructuredTaskInput } from './provider';

// Explicit development fixture, not a language model or natural-language clock.
export class MockAiProvider implements AiProvider {
  readonly mode = 'MOCK' as const;
  async generateStructuredTask(input: StructuredTaskInput) {
    const text = input.text.trim();
    const current = input.currentFields ?? {};
    const fields: Omit<TaskDraftFields, 'locationId'> = {
      title: current.title || text.slice(0, 120),
      instructions: current.instructions ? current.instructions.trim().replace(/\s+/g, ' ') : text,
      helpType: current.helpType || (/grocer|pick up|errand/i.test(text) ? 'ERRANDS' : 'GENERAL'),
    };
    if (/urgent/i.test(text)) fields.urgency = 'URGENT';
    if (/volunteer|unpaid/i.test(text)) fields.compensationType = 'VOLUNTEER';
    const points = /\b(\d+)\s+points\b/i.exec(text);
    if (points) { fields.compensationType = 'POINTS'; fields.pointReward = Number(points[1]); }
    const paid = /\b(\d+(?:\.\d+)?)\s+(USD|EUR|GBP)\b/i.exec(text);
    if (paid) { fields.compensationType = 'PAID'; fields.cashAmount = Number(paid[1]); fields.currency = paid[2].toUpperCase(); }
    const dates = text.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})/g);
    const warnings = ['Deterministic development mock. Review every proposed field; this is not a real AI result.'];
    if (dates?.length === 2) { fields.startAt = dates[0]; fields.endAt = dates[1]; }
    else if (/tomorrow|morning|afternoon|tonight|next|friday|tuesday/i.test(text)) {
      warnings.push(`Time wording is ambiguous in ${input.timezone}; choose exact start and end times manually.`);
      // An editing request must not silently retain old times for a new day.
      if (current.startAt || current.endAt) { fields.startAt = null; fields.endAt = null; }
    }
    const location = /\blocation:\s*([^\n;]+)/i.exec(text);
    return { fields, ...(location ? { locationText: location[1].trim().slice(0, 500) } : {}), warnings };
  }
  async summarizeTask(fields: Omit<TaskDraftFields, 'locationId'>) {
    return { summary: [fields.title, fields.instructions].filter(Boolean).join(' — ').slice(0, 800) || 'No task description yet.',
      warnings: ['Derived development mock summary. Task fields remain authoritative.'] };
  }
}
