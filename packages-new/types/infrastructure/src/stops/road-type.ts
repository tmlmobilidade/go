/* * */

import { z } from 'zod';

/* * */

const StopRoadTypeValues = [
	'complementary_itinerary',
	'highway',
	'main_itinerary',
	'national_road',
	'regional_road',
	'secondary_road',
	'unknown',
] as const;

export const StopRoadTypeSchema = z.enum(StopRoadTypeValues);

export type StopRoadType = z.infer<typeof StopRoadTypeSchema>;
