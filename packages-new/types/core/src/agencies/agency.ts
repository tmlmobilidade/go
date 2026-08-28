/* * */

import { BaseDocumentSchema, OperationalDateIntSchema, TimezoneIdentifiedSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { AgencyAlertsMapSchema } from './alerts-map.js';
import { AgencyApexSchema } from './apex.js';
import { AgencyFinancialsSchema } from './financials.js';
import { AgencyOpenDataSchema } from './open-data.js';

/* * */

export const AgencySchema = BaseDocumentSchema.extend({
	alerts_map: AgencyAlertsMapSchema,
	apex: AgencyApexSchema,
	code: z.string().max(20),
	contact_emails_pta: z.array(z.string().email()).default([]),
	contact_emails_pto: z.array(z.string().email()).default([]),
	fare_url: z.string().url(),
	financials: AgencyFinancialsSchema,
	name: z.string(),
	open_data: AgencyOpenDataSchema,
	operation_start_date: OperationalDateIntSchema.nullable().default(null),
	phone: z.string(),
	pta_name: z.string().default(''),
	public_email: z.string().email(),
	public_name: z.string(),
	short_name: z.string().max(4).default(''),
	timezone: TimezoneIdentifiedSchema.default('Europe/Lisbon'),
	validation_rules: z.any().nullable().default(null),
	website_url: z.string().url(),
});

export const CreateAgencySchema = AgencySchema.omit({ created_at: true, updated_at: true });
export const UpdateAgencySchema = CreateAgencySchema.omit({ created_by: true }).partial();

/* * */

export type Agency = z.infer<typeof AgencySchema>;
export type CreateAgencyDto = z.infer<typeof CreateAgencySchema>;
export type UpdateAgencyDto = z.infer<typeof UpdateAgencySchema>;
