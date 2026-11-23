/* * */

import { z } from 'zod';

/* * */

/** The agency-owned Offer period code exported in calendar_dates.period. */
export const GtfsStrictV29PeriodSchema = z.string().trim().min(1);

export type GtfsStrictV29Period = z.infer<typeof GtfsStrictV29PeriodSchema>;
