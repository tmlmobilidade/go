import { z } from 'zod';

export const ChangelogsPermissionActionsSchema = z.enum(['read', 'update', 'delete']);
export type ChangelogsPermissionActions = z.infer<typeof ChangelogsPermissionActionsSchema>;
