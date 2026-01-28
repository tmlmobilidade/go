/* * */

import { z } from 'zod';

/* * */

const VehicleEmissionValues = [
	'EURO_I',
	'EURO_II',
	'EURO_III',
	'EURO_IV',
	'EURO_V',
	'EURO_VI',
] as const;

export const VehicleEmissionSchema = z.enum(VehicleEmissionValues);
export type VehicleEmission = z.infer<typeof VehicleEmissionSchema>;
