import { z } from 'zod';

import { RuleConfigSchema } from './severity.js';

const RuleConfigWithOptionsSchema = RuleConfigSchema.extend({
	options: z.array(z.string()).default([]),
});

const RuleConfigWithCompareSchema = RuleConfigSchema.extend({
	compare: z.array(z.object({
		key: z.string(),
		value: z.string(),
	})).default([]),
});

export const RuleConfigWithDefaultsSchema = RuleConfigSchema.optional().default({});
export const RuleConfigWithOptionsDefaultsSchema = RuleConfigWithOptionsSchema.optional().default({});
export const RuleConfigWithCompareDefaultsSchema = RuleConfigWithCompareSchema.optional().default({});
