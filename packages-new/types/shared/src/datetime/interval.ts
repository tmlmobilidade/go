/* * */

import { z } from 'zod';

import { UnixMillisecondsSchema } from './unix-millis.js';

/* * */

export const TimeIntervalSchema = z.object({
	end: UnixMillisecondsSchema,
	start: UnixMillisecondsSchema,
});

/**
 * A time interval.
 */
export type TimeInterval = z.infer<typeof TimeIntervalSchema>;
