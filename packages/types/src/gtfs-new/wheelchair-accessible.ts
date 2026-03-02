/* * */

import { z } from 'zod';

/* * */

export const GtfsWheelchairBoardingSchema = z.union([
    z.literal(0), // No accessibility information
    z.literal(1), // Wheelchair accessible
    z.literal(2), // Not wheelchair accessible
]);
export type GtfsWheelchairBoarding = z.infer<typeof GtfsWheelchairBoardingSchema>;