import { z } from 'zod';

/* * */

// Keep aligned with GO's domain modules; `root` is an application shell.
export const ContentModuleIdValues = ['core', 'dates', 'exporter', 'hub', 'infrastructure', 'offer', 'operation', 'performance'] as const;
export const ContentModuleIdSchema = z.enum(ContentModuleIdValues);
export type ContentModuleId = z.infer<typeof ContentModuleIdSchema>;

export const ContentScopeSchema = z.discriminatedUnion('type', [
	z.object({ type: z.literal('platform') }).strict(),
	z.object({
		module_ids: z.array(ContentModuleIdSchema).nonempty().refine(ids => new Set(ids).size === ids.length, 'Module IDs must be unique'),
		type: z.literal('modules'),
	}).strict(),
]);

export type ContentScope = z.infer<typeof ContentScopeSchema>;
