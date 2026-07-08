import { z } from 'zod';

const SeveritySchema = ['error', 'forbidden', 'ignore', 'warning'] as const;

export const RulesSeverityEnumSchema = z.enum(SeveritySchema);
export const RuleConfigSchema = z.object({
	severity: RulesSeverityEnumSchema.default('ignore'),
});

export type Severity = z.infer<typeof RulesSeverityEnumSchema>;
export type RuleConfig = z.infer<typeof RuleConfigSchema>;
