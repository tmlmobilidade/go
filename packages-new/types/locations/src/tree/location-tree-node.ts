import { z } from 'zod';

/* * */

const LocationTreeNodeFieldsSchema = z.object({
	/** OSM admin_level (e.g. "7" for Portuguese municipalities). */
	admin_level: z.string(),
	/** National statistics code, when available. */
	code: z.string().nullable(),
	/** Absolute OSM ID, serialized for tree selection values. */
	id: z.string().regex(/^[1-9]\d*$/),
	name: z.string().min(1),
});

export type LocationTreeNode = z.infer<typeof LocationTreeNodeFieldsSchema> & { children: LocationTreeNode[] };

/** Canonical administrative tree received from the locations cache or API. */
export const LocationTreeNodeSchema: z.ZodType<LocationTreeNode> = LocationTreeNodeFieldsSchema.extend({
	children: z.lazy(() => LocationTreeNodeSchema.array()),
});
