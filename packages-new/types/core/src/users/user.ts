/* * */

import { PermissionSchema } from '@tmlmobilidade/go-types-permissions';
import { BaseDocumentSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { UserAnalyticsSchema } from './analytics.js';
import { UserBannerDismissalSchema } from './banner-dismissal.js';
import { UserChangelogSeenSchema } from './changelog-seen.js';

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

export const UserSchema = BaseDocumentSchema.extend({
	analytics: UserAnalyticsSchema.nullish(),
	dismissed_banners: z.array(UserBannerDismissalSchema).default([]),
	email: z.email(),
	email_verified: UnixMillisecondsSchema.nullable().default(null),
	first_name: z.string().min(2),
	last_name: z.string().min(2),
	organization_id: z.string(),
	password_hash: z.string().nullable().default(null),
	permissions: z.array(PermissionSchema).default([]),
	phone: z.string().nullable().default(null),
	preferences: z.record(z.string(), z.record(z.string(), UserPreferenceValueSchema)).nullable().default(null),
	role_ids: z.array(z.string()).default([]),
	seen_changelogs: z.array(UserChangelogSeenSchema).default([]),
	seen_last_at: UnixMillisecondsSchema.nullable().default(null),
	session_ids: z.array(z.string()).default([]),
	verification_token_ids: z.array(z.string()).default([]),
});

export type User = z.infer<typeof UserSchema>;

/* * */

export const UserDisplayFields = { _id: true, email: true, first_name: true, last_name: true, phone: true } as const;
export const UserDisplaySchema = UserSchema.pick(UserDisplayFields);

export type UserDisplay = z.infer<typeof UserDisplaySchema>;
export type WithUser<T> = Omit<T, 'created_by' | 'updated_by'> & {
	created_by?: string | UserDisplay
	updated_by?: string | UserDisplay
};
