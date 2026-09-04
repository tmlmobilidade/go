/* * */

import { z } from 'zod';

import { ParishPropertiesSchema } from './parish-properties.js';

/* * */

export const ParishSchema = ParishPropertiesSchema.extend({
	_id: z.string(),
});

/**
 * Represents a Parish with its ID and properties.
 */
export type Parish = z.infer<typeof ParishSchema>;
