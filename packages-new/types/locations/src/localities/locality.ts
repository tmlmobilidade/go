/* * */

import { z } from 'zod';

import { LocalityPropertiesSchema } from './locality-properties.js';

/* * */

export const LocalitySchema = LocalityPropertiesSchema.extend({
	_id: z.string(),
});

/**
 * Represents a Locality with its ID and properties.
 */
export type Locality = z.infer<typeof LocalitySchema>;
