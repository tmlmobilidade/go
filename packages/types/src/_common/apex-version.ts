/* * */

import { z } from 'zod';

/* * */

export const ApexVersionValues = ['3.2.6', '3.2.0'] as const;
export const ApexVersionSchema = z.enum(ApexVersionValues);
export type ApexVersion = z.infer<typeof ApexVersionSchema>;
