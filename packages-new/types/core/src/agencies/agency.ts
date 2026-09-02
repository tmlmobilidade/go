/* * */

import { BaseDocumentSchema, LanguageTagSchema, OperationalDateIntSchema, TimezoneIdentifiedSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { AgencyAlertsMapSchema } from './alerts-map.js';
import { AgencyAlertsSchema } from './alerts.js';
import { AgencyApexSchema } from './apex.js';
import { AgencyFinancialsSchema } from './financials.js';
import { AgencyOpenDataSchema } from './open-data.js';
import { AgencyPlansSchema } from './plans.js';

/* * */

export const AgencySchema = BaseDocumentSchema.extend({
	alerts: AgencyAlertsSchema,
	apex: AgencyApexSchema,
	code: z.string().max(20),
	financials: AgencyFinancialsSchema,
	name: z.string(),
	open_data: AgencyOpenDataSchema,
	plans: AgencyPlansSchema,
	primary_language: LanguageTagSchema.default('pt'),
	pta_name: z.string().default(''),
	short_name: z.string().max(4).default(''),
	timezone: TimezoneIdentifiedSchema.default('Europe/Lisbon'),
	// DEPRECATED FIELDS
	alerts_map: AgencyAlertsMapSchema, // Deprecated
	contact_emails_pta: z.array(z.string().email()).default([]), // Deprecated
	contact_emails_pto: z.array(z.string().email()).default([]), // Deprecated
	fare_url: z.string().url(), // Deprecated
	operation_start_date: OperationalDateIntSchema.nullable().default(null), // Deprecated
	phone: z.string(), // Deprecated
	public_email: z.string().email(), // Deprecated
	public_name: z.string(), // Deprecated
	validation_rules: z.any().nullable().default(null), // Deprecated
	website_url: z.string().url(), // Deprecated
});

export const CreateAgencySchema = AgencySchema.omit({ created_at: true, updated_at: true });
export const UpdateAgencySchema = CreateAgencySchema.omit({ created_by: true }).partial();

/* * */

export type Agency = z.infer<typeof AgencySchema>;
export type CreateAgencyDto = z.infer<typeof CreateAgencySchema>;
export type UpdateAgencyDto = z.infer<typeof UpdateAgencySchema>;
