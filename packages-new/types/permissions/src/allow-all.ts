/* * */

import { z } from 'zod';

/* * */

export const AllowAllFlagValue = 'allow_all';

export const AllowAllFlagSchema = z.literal(AllowAllFlagValue);

export type AllowAllFlag = z.infer<typeof AllowAllFlagSchema>;
