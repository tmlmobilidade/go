/* * */

import { DocumentSchema } from '@/_common/document.js';
import { UnixTimeStampSchema } from '@/_common/unix-timestamp.js';
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

export const UserPinsSchema = z.object({
	controller: z.array(z.string()).default([]),
}).default({ controller: [] });

export type UserPins = z.infer<typeof UserPinsSchema>;

/* * */

export const UserSchema_UNSAFE = DocumentSchema.extend({
	email: z.string().email(),
	email_verified: UnixTimeStampSchema.nullable().default(null),
	first_name: z.string().min(2),
	last_name: z.string().min(2),
	organization_id: z.string(),
	password_hash: z.string().nullable().default(null),
	permissions: z.array(PermissionSchema).default([]),
	phone: z.string().nullable().default(null),
	pins: UserPinsSchema,
	preferences: z.record(z.record(UserPreferenceValueSchema)).nullable().default(null),
	role_ids: z.array(z.string()).default([]),
	seen_last_at: UnixTimeStampSchema.nullable().default(null),
	session_ids: z.array(z.string()).default([]),
	verification_token_ids: z.array(z.string()).default([]),
});

export const CreateUserSchema = UserSchema_UNSAFE.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateUserSchema = CreateUserSchema.omit({ created_by: true, session_ids: true, verification_token_ids: true }).partial();
export const UserSchema = UserSchema_UNSAFE.omit({ password_hash: true, session_ids: true, verification_token_ids: true });

/* * */

export type User_UNSAFE = z.infer<typeof UserSchema_UNSAFE>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type User = z.infer<typeof UserSchema>;

/* * */

export const UserDisplayFields = { _id: true, email: true, first_name: true, last_name: true, phone: true } as const;
export const UserDisplaySchema = UserSchema.pick(UserDisplayFields);

export type UserDisplay = z.infer<typeof UserDisplaySchema>;
export type WithUser<T> = Omit<T, 'created_by' | 'updated_by'> & {
	created_by?: string | UserDisplay
	updated_by?: string | UserDisplay
};
