/* * */

import { DocumentSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/**
 * @deprecated Use the `HashedTrip` type from the `@tmlmobilidade/go-types-operation` package instead.
 */
export const HashedLineSchema = DocumentSchema
	.omit({ created_by: true, is_locked: true, updated_by: true })
	.extend({
		agency_id: z.string(),
		line_id: z.number(),
		line_long_name: z.string(),
		line_short_name: z.string(),
		pattern_id: z.string(),
		route_color: z.string(),
		route_id: z.string(),
		route_long_name: z.string(),
		route_short_name: z.string(),
		route_text_color: z.string(),
		trip_headsign: z.string(),
	});

/**
 * @deprecated Use the `HashedTrip` type from the `@tmlmobilidade/go-types-operation` package instead.
 */
export type HashedLine = z.infer<typeof HashedLineSchema>;
