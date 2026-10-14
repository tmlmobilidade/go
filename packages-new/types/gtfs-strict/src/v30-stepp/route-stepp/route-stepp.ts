/* * */

import { z } from 'zod';

/* * */

export const GtfsStrictV30SteppRouteSteppSchema = z.object({
	route_destination: z.string(),
	route_id: z.string(),
	route_origin: z.string(),
});

/** Pattern origins and destinations exported in route_stepp.txt. */
export type GtfsStrictV30SteppRouteStepp = z.infer<typeof GtfsStrictV30SteppRouteSteppSchema>;
