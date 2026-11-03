/* * */

import { AgencyOpenDataSchema } from '@tmlmobilidade/go-types-core';
import { LanguageTagSchema, TimezoneIdentifiedSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubV1ApiAgencySchema = z.object({
	_id: z.string(),
	code: z.string().max(20),
	open_data: AgencyOpenDataSchema,
	primary_language: LanguageTagSchema,
	timezone: TimezoneIdentifiedSchema,
});

/**
 * Agency data for the Hub V1 Agencies API.
 */
export type HubV1ApiAgency = z.infer<typeof HubV1ApiAgencySchema>;

