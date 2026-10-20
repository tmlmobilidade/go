/* * */

import { LanguageTagSchema, TimezoneIdentifiedSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const SimplifiedAgencySchema = z.object({
	code: z.string().max(20),
	name: z.string(),
	primary_language: LanguageTagSchema.default('pt'),
	pta_name: z.string().default(''),
	short_name: z.string().max(4).default(''),
	timezone: TimezoneIdentifiedSchema.default('Europe/Lisbon'),
});

export type SimplifiedAgency = z.infer<typeof SimplifiedAgencySchema>;
