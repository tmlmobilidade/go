/* * */

import { z } from 'zod';

/* * */

export const GtfsRtWheelchairAccessibleValues = [
	'NO_VALUE',
	'UNKNOWN',
	'WHEELCHAIR_ACCESSIBLE',
	'WHEELCHAIR_INACCESSIBLE',
] as const;

export const GtfsRtWheelchairAccessibleSchema = z.enum(GtfsRtWheelchairAccessibleValues);

export type GtfsRtWheelchairAccessible = z.infer<typeof GtfsRtWheelchairAccessibleSchema>;
