/* * */

import { PermissionSchema } from '@/permissions/index.js';
import { DocumentSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RoleSchema = DocumentSchema.extend({
	name: z.string(),
	permissions: z.array(PermissionSchema).default([]),
});

export const CreateRoleSchema = RoleSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateRoleSchema = CreateRoleSchema.omit({ created_by: true }).partial();

export type Role = z.infer<typeof RoleSchema>;
export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>;
