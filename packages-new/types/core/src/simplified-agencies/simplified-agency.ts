/* * */

import { LanguageTagSchema, TimezoneIdentifiedSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const SimplifiedAgencySchema = z.object({
	_id: z.string(),
	code: z.string().max(20),
	created_at: UnixMillisecondsSchema,
	name: z.string(),
	primary_language: LanguageTagSchema.default('pt'),
	pta_name: z.string().default(''),
	short_name: z.string().max(4).default(''),
	timezone: TimezoneIdentifiedSchema.default('Europe/Lisbon'),
	updated_at: UnixMillisecondsSchema,
});

export type SimplifiedAgency = z.infer<typeof SimplifiedAgencySchema>;
