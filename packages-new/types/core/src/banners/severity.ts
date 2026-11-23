/* * */

import { z } from 'zod';

/* * */

export const BannerSeverityValues = ['info', 'warning', 'critical'] as const;
export const BannerSeveritySchema = z.enum(BannerSeverityValues);

export type BannerSeverity = z.infer<typeof BannerSeveritySchema>;
