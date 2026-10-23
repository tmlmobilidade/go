/* * */

import { FareSimplifiedSchema, LineSchema, RouteSimplifiedSchema, TypologySimplifiedSchema } from '@tmlmobilidade/go-types-offer';
import { z } from 'zod';

/* * */

export const PopulatedLineSchema = LineSchema.extend({
	onboard_fares_data: z.array(FareSimplifiedSchema).optional().default([]),
	prepaid_fare_data: FareSimplifiedSchema.nullable().optional().default(null),
	routes: z.array(RouteSimplifiedSchema).optional().default([]),
	typology_data: TypologySimplifiedSchema.nullable().optional().default(null),
});

export type PopulatedLine = z.infer<typeof PopulatedLineSchema>;
