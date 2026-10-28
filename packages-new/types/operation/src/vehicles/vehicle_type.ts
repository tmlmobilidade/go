/* * */

import { z } from 'zod';

/* * */

export const VehicleTypeValues = [
	'0', // Tram, Streetcar, Light rail
	'1', // Metro, Subway
	'2', // Rail
	'3', // Bus
	'4', // Ferry
	'5', // Cable tram
	'6', // Aerial lift, suspended cable car (e.g., gondola lift, aerial tramway)
	'7', // Funicular
	'11', // Trolleybus
	'12', // Monorail
] as const;

export const VehicleTypeSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(VehicleTypeValues));

export type VehicleType = z.infer<typeof VehicleTypeSchema>;
