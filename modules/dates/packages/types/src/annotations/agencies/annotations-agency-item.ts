/* * */

import { AgencySchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const AnnotationsAgencyItemSchema = AgencySchema.pick({
	_id: true,
	code: true,
	name: true,
});

/**
 * The item schema for listing annotations agencies.
 * It is intended for use in the annotations module.
 */
export type AnnotationsAgencyItem = z.infer<typeof AnnotationsAgencyItemSchema>;
