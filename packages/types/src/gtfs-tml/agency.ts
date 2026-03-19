/* * */

import { GtfsAgencySchema } from '@/gtfs/agency.js';
import { z } from 'zod';

/* * */

export const GtfsTMLAgencySchema = GtfsAgencySchema;
export type GtfsTMLAgency = z.infer<typeof GtfsTMLAgencySchema>;
