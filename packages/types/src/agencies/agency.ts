/* * */

import { DocumentSchema } from '@/_common/document.js';
import { OperationalDateSchema } from '@/_common/operational-date.js';
import { AgencyAlertMapSchema } from '@/agencies/alert-map.js';
import { AgencyFinancialsSchema } from '@/agencies/financials.js';
import { z } from 'zod';

/* * */

export const AgencySchema = DocumentSchema.extend({
	alerts_map: AgencyAlertMapSchema,
	code: z.string().max(20),
	contact_emails_pta: z.array(z.string().email()).default([]),
	contact_emails_pto: z.array(z.string().email()).default([]),
	fare_url: z.string().url(),
	financials: AgencyFinancialsSchema,
	name: z.string(),
	operation_start_date: OperationalDateSchema.nullable().default(null),
	phone: z.string(),
	public_email: z.string().email(),
	public_name: z.string(),
	short_name: z.string().max(4),
	timezone: z.string().default('Europe/Lisbon'),
	validation_rules: z.any().nullable().default(null),
	website_url: z.string().url(),
});

export const CreateAgencySchema = AgencySchema.omit({ created_at: true, updated_at: true });
export const UpdateAgencySchema = CreateAgencySchema.omit({ created_by: true }).partial();

/* * */

export type Agency = z.infer<typeof AgencySchema>;
export type CreateAgencyDto = z.infer<typeof CreateAgencySchema>;
export type UpdateAgencyDto = z.infer<typeof UpdateAgencySchema>;
