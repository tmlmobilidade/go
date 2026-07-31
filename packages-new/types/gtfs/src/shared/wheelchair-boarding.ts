/* * */

import { z } from 'zod';

/* * */

export const GtfsWheelchairBoardingValues = [
	'0', // No accessibility information
	'1', // Wheelchair accessible
	'2', // Not wheelchair accessible
] as const;

export const GtfsWheelchairBoardingSchema = z.enum(GtfsWheelchairBoardingValues);

export type GtfsWheelchairBoarding = z.infer<typeof GtfsWheelchairBoardingSchema>;
