/* * */

import { z } from 'zod';

import { MunicipalityPropertiesSchema } from './municipality-properties.js';

/* * */

export const MunicipalitySchema = MunicipalityPropertiesSchema.extend({
	_id: z.string(),
});

/**
 * Represents a Municipality with its ID and properties.
 */
export type Municipality = z.infer<typeof MunicipalitySchema>;
