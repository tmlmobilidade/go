import { z } from 'zod';

export const ChangelogsPermissionScopeSchema = z.literal('changelogs');
export type ChangelogsPermissionScope = z.infer<typeof ChangelogsPermissionScopeSchema>;
