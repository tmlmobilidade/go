/* * */

import { NonNegativeIntegerSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubShapeSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	extension: NonNegativeIntegerSchema,
	shape_polyline: z.string().optional(),
});

/**
 * Shape data for the Hub Network API.
 */
export type HubShape = z.infer<typeof HubShapeSchema>;
