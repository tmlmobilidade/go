/* * */

import { z } from 'zod';

/* * */

export const GtfsRtOccupancyStatusValues = [
	'EMPTY',
	'MANY_SEATS_AVAILABLE',
	'FEW_SEATS_AVAILABLE',
	'STANDING_ROOM_ONLY',
	'CRUSHED_STANDING_ROOM_ONLY',
	'FULL',
	'NOT_ACCEPTING_PASSENGERS',
	'NO_DATA_AVAILABLE',
	'NOT_BOARDABLE',
] as const;

export const GtfsRtOccupancyStatusSchema = z.enum(GtfsRtOccupancyStatusValues);

export type GtfsRtOccupancyStatus = z.infer<typeof GtfsRtOccupancyStatusSchema>;
