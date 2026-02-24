/* * */

import { z } from 'zod';

/* * */

const VehiclePropulsionValues = [
	'gasoline',
	'diesel',
	'lpg_auto',
	'mixture',
	'biodiesel',
	'electricity',
	'hybrid',
	'natural_gas',
] as const;

export const VehiclePropulsionSchema = z.enum(VehiclePropulsionValues);
export type VehiclePropulsion = z.infer<typeof VehiclePropulsionSchema>;
