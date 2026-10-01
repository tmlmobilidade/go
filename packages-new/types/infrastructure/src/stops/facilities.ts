/* * */

import { z } from 'zod';

/* * */

export const StopFacilityValues = [
	'fire_station',
	'health_clinic',
	'historic_building',
	'hospital',
	'police_station',
	'school',
	'shopping',
	'transit_office',
	'university',
	'beach',
] as const;

export const StopFacilitySchema = z.enum(StopFacilityValues);

export type StopFacility = z.infer<typeof StopFacilitySchema>;
