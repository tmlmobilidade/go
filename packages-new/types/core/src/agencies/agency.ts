/* * */

import { BaseDocumentSchema, LanguageTagSchema, TimezoneIdentifiedSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { AgencyAlertsSchema } from './alerts.js';
import { AgencyFinancialsSchema } from './financials.js';
import { AgencyOpenDataSchema } from './open-data.js';
import { AgencyPlansSchema } from './plans.js';

/* * */

export const AgencySchema = BaseDocumentSchema.extend({
	alerts: AgencyAlertsSchema,
	code: z.string().max(20),
	financials: AgencyFinancialsSchema,
	name: z.string(),
	open_data: AgencyOpenDataSchema,
	plans: AgencyPlansSchema,
	primary_language: LanguageTagSchema.default('pt'),
	pta_name: z.string().default(''),
	short_name: z.string().max(4).default(''),
	timezone: TimezoneIdentifiedSchema.default('Europe/Lisbon'),
});

export const CreateAgencySchema = AgencySchema.omit({ created_at: true, updated_at: true });
export const UpdateAgencySchema = CreateAgencySchema.omit({ created_by: true }).partial();

/* * */

export type Agency = z.infer<typeof AgencySchema>;
export type CreateAgencyDto = z.infer<typeof CreateAgencySchema>;
export type UpdateAgencyDto = z.infer<typeof UpdateAgencySchema>;
