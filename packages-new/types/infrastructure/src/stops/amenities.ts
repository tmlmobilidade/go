/* * */

import { AvailabilityStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const StopAmenitiesSchema = z.object({
	has_bench: AvailabilityStatusSchema.default('unknown'),
	has_mupi: AvailabilityStatusSchema.default('unknown'),
	has_network_map: AvailabilityStatusSchema.default('unknown'),
	has_schedules: AvailabilityStatusSchema.default('unknown'),
	has_shelter: AvailabilityStatusSchema.default('unknown'),
	has_stop_sign: AvailabilityStatusSchema.default('unknown'),
});

export type StopAmenities = z.infer<typeof StopAmenitiesSchema>;
