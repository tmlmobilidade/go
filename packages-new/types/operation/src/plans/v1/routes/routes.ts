/* * */

import { z } from 'zod';

/* * */

export const OperationPostersV1RoutesSchema = z.object({
	agency_id: z.string(),
	route_color: z.string().transform(value => value.replace(/^#/, '').toUpperCase()).pipe(z.string().regex(/^([0-9A-F]{6})?$/)).default(''),
	route_id: z.string(),
	route_long_name: z.string().default(''),
	route_short_name: z.string().default(''),
	route_text_color: z.string().transform(value => value.replace(/^#/, '').toUpperCase()).pipe(z.string().regex(/^([0-9A-F]{6})?$/)).default(''),
	route_type: z.union([z.string(), z.number()]).transform(String).pipe(z.enum(['0', '1', '2', '3', '4', '5', '6', '7', '11', '12'])),
});

export type OperationPostersV1Routes = z.output<typeof OperationPostersV1RoutesSchema>;
