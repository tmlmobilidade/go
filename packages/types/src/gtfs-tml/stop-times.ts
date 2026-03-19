/* * */

import { GtfsStopTimesSchema } from '@/gtfs-new/stop-times.js';
import { z } from 'zod';

/* * */

export const GtfsTMLStopTimesSchema = GtfsStopTimesSchema;
export type GtfsTMLStopTimes = z.infer<typeof GtfsTMLStopTimesSchema>;
