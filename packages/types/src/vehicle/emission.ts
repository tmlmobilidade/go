/* * */

import { z } from 'zod';

/* * */

const VehicleEmissionValues = [
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
] as const;

export const VehicleEmissionSchema = z.enum(VehicleEmissionValues);
export type VehicleEmission = z.infer<typeof VehicleEmissionSchema>;
