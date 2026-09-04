/* * */

import { AgencyAlertsSchema, AgencySchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const AlertsAgencyItemSchema = AgencySchema.pick({
	_id: true,
	code: true,
	name: true,
	short_name: true,
}).extend({
	alerts: AgencyAlertsSchema.pick({
		catalog: true,
	}),
});

/**
 * The item schema for listing alerts agencies.
 * It is intended for use in the alerts module.
 */
export type AlertsAgencyItem = z.infer<typeof AlertsAgencyItemSchema>;
