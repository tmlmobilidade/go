/* * */

import { z } from 'zod';

/* * */

export const GtfsRtCongestionLevelValues = [
	'UNKNOWN_CONGESTION_LEVEL',
	'RUNNING_SMOOTHLY',
	'STOP_AND_GO',
	'CONGESTION',
	'SEVERE_CONGESTION',
] as const;

export const GtfsRtCongestionLevelSchema = z.enum(GtfsRtCongestionLevelValues);

export type GtfsRtCongestionLevel = z.infer<typeof GtfsRtCongestionLevelSchema>;
