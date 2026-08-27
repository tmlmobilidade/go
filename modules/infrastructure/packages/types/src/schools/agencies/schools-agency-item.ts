/* * */

import { AgencySchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const SchoolsAgencyItemSchema = AgencySchema.pick({
	_id: true,
	code: true,
	name: true,
	short_name: true,
});

/**
 * The item schema for listing schools agencies.
 * It is intended for use in the schools module.
 */
export type SchoolsAgencyItem = z.infer<typeof SchoolsAgencyItemSchema>;
