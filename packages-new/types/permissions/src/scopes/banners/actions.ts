import { z } from 'zod';

export const BannersPermissionActionsSchema = z.enum(['read', 'update', 'delete']);
export type BannersPermissionActions = z.infer<typeof BannersPermissionActionsSchema>;
