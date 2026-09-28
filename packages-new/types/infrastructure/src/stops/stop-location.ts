/* * */

import { z } from 'zod';

/* * */

const StopLocationItemSchema = z.object({
	admin_level: z.string(),
	code: z.string().optional(),
	name: z.string(),
	osm_id: z.number(),
});

export const StopLocationSchema = z.object({

	// District
	primary: StopLocationItemSchema,

	// Municipality
	secondary: StopLocationItemSchema,

	// Parish
	tertiary: StopLocationItemSchema,

	// Locality
	neighbourhood: StopLocationItemSchema,

	// Locality
	country: StopLocationItemSchema,

});

