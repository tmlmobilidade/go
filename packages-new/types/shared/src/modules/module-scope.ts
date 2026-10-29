import { z } from 'zod';

import { ModuleIdSchema } from './module-id.js';

/* * */

export const ModuleScopeSchema = z.discriminatedUnion('type', [
	z.object({ type: z.literal('platform') }).strict(),
	z.object({
		module_ids: z.array(ModuleIdSchema).nonempty().refine(ids => new Set(ids).size === ids.length, 'Module IDs must be unique'),
		type: z.literal('modules'),
	}).strict(),
]);

export type ModuleScope = z.infer<typeof ModuleScopeSchema>;
