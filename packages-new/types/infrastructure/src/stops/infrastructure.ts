/* * */

import { StopRoadTypeSchema } from '@/stops/road-type.js';
import { AvailabilityStatusSchema, ConditionStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const StopInfrastructureSchema = z.object({
	bench_status: ConditionStatusSchema.default('unknown'),
	electricity_status: AvailabilityStatusSchema.default('unknown'),
	pole_status: ConditionStatusSchema.default('unknown'),
	road_type: StopRoadTypeSchema.default('unknown'),
});

export type StopInfrastructure = z.infer<typeof StopInfrastructureSchema>;
