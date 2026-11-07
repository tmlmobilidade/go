/* * */

import { PermissionSchema } from '@tmlmobilidade/go-types-permissions';
import { BaseDocumentSchema, partialWithoutDefaults } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RoleSchema = BaseDocumentSchema.extend({
	name: z.string(),
	permissions: z.array(PermissionSchema).default([]),
});

export const CreateRoleSchema = RoleSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateRoleSchema = partialWithoutDefaults(CreateRoleSchema.omit({ created_by: true }));

export type Role = z.infer<typeof RoleSchema>;
export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>;
