/* * */

import { z } from 'zod';

import { UnixTimestampSchema } from './unix-millis.js';

/* * */

export const TimeIntervalSchema = z.object({
	end: UnixTimestampSchema,
	start: UnixTimestampSchema,
});

/**
 * A time interval.
 */
export type TimeInterval = z.infer<typeof TimeIntervalSchema>;
