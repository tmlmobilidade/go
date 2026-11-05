import { z } from 'zod';

export const BannersPermissionScopeSchema = z.literal('banners');
export type BannersPermissionScope = z.infer<typeof BannersPermissionScopeSchema>;
