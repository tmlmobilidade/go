/* * */

import { z } from 'zod';

/* * */

/** The agency-owned Offer period code exported in calendar_dates.period. */
export const GtfsStrictV29ExtPeriodSchema = z.string().trim().min(1);

export type GtfsStrictV29ExtPeriod = z.infer<typeof GtfsStrictV29ExtPeriodSchema>;
