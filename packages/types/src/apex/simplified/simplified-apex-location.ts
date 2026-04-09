/* * */

import { DocumentSchema } from '@/_common/document.js';
import { UnixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { z } from 'zod';

/* * */

export const SimplifiedApexLocationSchema = DocumentSchema
	.omit({ created_by: true, is_locked: true, updated_by: true })
	.extend({
		agency_id: z.string(),
		apex_version: z.string(),
		device_id: z.string(),
		line_id: z.string(),
		mac_ase_counter_value: z.number(),
		mac_sam_serial_number: z.number(),
		pattern_id: z.string(),
		received_at: UnixTimeStampSchema,
		stop_id: z.string(),
		trip_id: z.string(),
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
