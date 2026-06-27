/* * */

import { z } from 'zod';

/* * */

const VehiclePropulsionValues = [
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
] as const;

export const VehiclePropulsionSchema = z.enum(VehiclePropulsionValues);
export type VehiclePropulsion = z.infer<typeof VehiclePropulsionSchema>;
