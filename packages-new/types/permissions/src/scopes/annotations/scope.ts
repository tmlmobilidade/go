/* * */

import { z } from 'zod';

/* * */

export const AnnotationsPermissionScopeSchema = z.literal('annotations');

export type AnnotationsPermissionScope = z.infer<typeof AnnotationsPermissionScopeSchema>;
