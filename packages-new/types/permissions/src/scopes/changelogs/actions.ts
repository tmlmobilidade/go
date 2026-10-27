import { z } from 'zod';

export const ChangelogsPermissionActionsSchema = z.enum(['read', 'update']);
export type ChangelogsPermissionActions = z.infer<typeof ChangelogsPermissionActionsSchema>;
