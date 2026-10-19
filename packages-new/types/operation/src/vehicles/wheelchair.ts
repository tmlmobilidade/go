/* * */

import { z } from 'zod';

/* * */

const VehicleWheelchairValues = [
	'no',
	'manual_ramp',
	'electric_ramp',
	'not_applicable',
] as const;

export const VehicleWheelchairSchema = z.enum(VehicleWheelchairValues);
export type VehicleWheelchair = z.infer<typeof VehicleWheelchairSchema>;
