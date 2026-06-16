/* * */

import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const SimplifiedApexLocationSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	apex_version: z.string(),
	created_at: UnixTimestampSchema,
	device_id: z.string(),
	line_id: z.string(),
	mac_ase_counter_value: z.number(),
	mac_sam_serial_number: z.number(),
	pattern_id: z.string(),
	received_at: UnixTimestampSchema,
	stop_id: z.string(),
	trip_id: z.string().nullable().default(null),
	vehicle_id: z.number(),
});

export const UpdateSimplifiedApexLocationSchema = SimplifiedApexLocationSchema.partial();

/**
 * APEX Locations are APEX transactions of type 19 that are generated every time the
 * setContext or setLocation functions are called. These functions are used to set
 * the service context of the validator machine, allowing for the correct sale and validation
 * of products. In summary, these transactions are generated every time the vehicle has a change
 * in the current stop ID, trip ID, route ID, pattern ID, etc.
 */
export type SimplifiedApexLocation = z.infer<typeof SimplifiedApexLocationSchema>;
export type UpdateSimplifiedApexLocationDto = z.infer<typeof UpdateSimplifiedApexLocationSchema>;
