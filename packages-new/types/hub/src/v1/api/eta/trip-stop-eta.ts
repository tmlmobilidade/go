/* * */

import { NonNegativeIntegerSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubV1ApiTripStopEtaSchema = z.object({
	eta_at: UnixMillisecondsSchema,
	eta_seconds: z.number().int(),
	stop_id: z.string(),
	stop_name: z.string(),
	stop_sequence: NonNegativeIntegerSchema,
	trip_id: z.string(),
	vehicle_id: z.string(),
});

/**
 * Trip stop ETA item for the Hub V1 ETA API (simplified JSON feeds).
 */
export type HubV1ApiTripStopEta = z.infer<typeof HubV1ApiTripStopEtaSchema>;
