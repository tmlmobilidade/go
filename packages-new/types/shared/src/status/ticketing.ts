/* * */

import { z } from 'zod';

/* * */

export const TicketingStatusValues = [
	'has_ticketing',
	'no_ticketing',
] as const;

export const TicketingStatusSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(TicketingStatusValues));

export type TicketingStatus = z.infer<typeof TicketingStatusSchema>;
