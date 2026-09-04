/* * */

import { z } from 'zod';

import { DistrictPropertiesSchema } from './district-properties.js';

/* * */

export const DistrictSchema = DistrictPropertiesSchema.extend({
	_id: z.string(),
});

/**
 * Represents a District with its ID and properties.
 */
export type District = z.infer<typeof DistrictSchema>;
