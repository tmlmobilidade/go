/* * */

import { z } from 'zod';

/* * */

export const BannerKindValues = ['maintenance', 'incident', 'announcement'] as const;
export const BannerKindSchema = z.enum(BannerKindValues);

export type BannerKind = z.infer<typeof BannerKindSchema>;
