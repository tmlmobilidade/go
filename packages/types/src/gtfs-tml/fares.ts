/* * */

import { z } from 'zod';

/* * */

/**
 * Fare attributes row for GTFS v29
 * Note: fare_attributes is not in standard GTFS types package
 */

export const GtfsTMLFareAttributesSchema = z.object({
	agency_id: z.string(),
	currency_type: z.string(),
	fare_id: z.string(),
	payment_method: z.number(),
	price: z.number(),
	transfers: z.number(),
});

/**
 * Fare rules row for GTFS v29
 * Note: fare_rules is not in standard GTFS types package
 */
export const GtfsTMLFareRulesSchema = z.object({
	agency_id: z.string(),
	fare_id: z.string(),
	route_id: z.string(),
});

export type GtfsTMLFareAttributes = z.infer<typeof GtfsTMLFareAttributesSchema>;
export type GtfsTMLFareRules = z.infer<typeof GtfsTMLFareRulesSchema>;
