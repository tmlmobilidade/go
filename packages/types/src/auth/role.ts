/* * */

import { PermissionSchema } from '@/permissions/index.js';
import { DocumentSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

// Role updates must keep permissions created with actions that are no longer
// present in the current permission catalog. Create operations remain strict.
const UpdatePermissionSchema = z.object({
	action: z.string(),
	resources: z.unknown().optional(),
	scope: z.string(),
}).passthrough().transform(permission => permission as z.infer<typeof PermissionSchema>);

export const RoleSchema = DocumentSchema.extend({
	name: z.string(),
	permissions: z.array(PermissionSchema).default([]),
});

export const CreateRoleSchema = RoleSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateRoleSchema = CreateRoleSchema.omit({ created_by: true }).partial().extend({
	permissions: z.array(UpdatePermissionSchema).optional(),
});

export type Role = z.infer<typeof RoleSchema>;
export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>;
