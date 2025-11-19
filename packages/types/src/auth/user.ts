/* * */

import { DocumentSchema } from '@/_common/document.js';
import { unixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { PermissionSchema } from '@/permissions/index.js';
import { z } from 'zod';

/* * */

export const UserPreferenceValueSchema = z.union([
	z.string(),
	z.number(),
	z.boolean(),
	z.array(z.string()),
	z.array(z.number()),
]);

export type UserPreferenceValue = z.infer<typeof UserPreferenceValueSchema>;

/* * */

export const UserSchema = DocumentSchema.extend({
	avatar: z.string().nullish(),
	bio: z.string().nullish(),
	email: z.string().email(),
	email_verified: unixTimeStampSchema.nullish(),
	first_name: z.string().nonempty(),
	last_name: z.string().nonempty(),
	organization_id: z.string().nullish(),
	password_hash: z.string().nullish(),
	permissions: z.array(PermissionSchema),
	phone: z.string().nullish(),
	preferences: z.record(z.record(UserPreferenceValueSchema)).nullish(),
	role_ids: z.array(z.string()).default([]),
	session_ids: z.array(z.string()).default([]),
	theme_id: z.string().nullish(),
	verification_token_ids: z.array(z.string()).default([]),
}).strip();

export const CreateUserSchema = UserSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateUserSchema = CreateUserSchema.omit({ created_by: true }).partial();

export type User = z.infer<typeof UserSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

export const UserDisplayFields = { _id: true, avatar: true, email: true, first_name: true, last_name: true, phone: true } as const;
export const UserDisplaySchema = UserSchema.pick(UserDisplayFields);

export type UserDisplay = z.infer<typeof UserDisplaySchema>;
export type WithUser<T> = Omit<T, 'created_by' | 'updated_by'> & {
	created_by?: string | UserDisplay
	updated_by?: string | UserDisplay
};
