/* * */

import { LanguageTagSchema, TimezoneIdentifiedSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubV1ApiAgencySchema = z.object({
	_id: z.string(),
	code: z.string().max(20),
	email: z.string().email(),
	fare_url: z.string().url(),
	name: z.string(),
	phone: z.string(),
	primary_language: LanguageTagSchema,
	services: z.object({
		eta_enabled: z.boolean().default(false),
		gtfs_enabled: z.boolean().default(false),
		positions_enabled: z.boolean().default(false),
		service_alerts_enabled: z.boolean().default(false),
	}),
	timezone: TimezoneIdentifiedSchema,
	website_url: z.string().url(),
});

/**
 * Agency data for the Hub V1 Agencies API.
 */
export type HubV1ApiAgency = z.infer<typeof HubV1ApiAgencySchema>;

