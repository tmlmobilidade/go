/* * */

import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

// NONE OF THIS IS BEING USED RIGHT NOW
// HOWEVER; IT SHOULD BE BECAUSE IT AVOIDS UNNECESSARY TYPE CHECKS
// AND PREVENTS STALE PREFERENCES TO BE KEPT IN THE DATABASE

export const UserPreferenceValueSchema = z.object({
	updated_at: UnixTimestampSchema,
	value: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.string()),
		z.array(z.number()),
	]),
});

export type UserPreferenceValue = z.infer<typeof UserPreferenceValueSchema>;

/* * */

export const UserPreferencesSchema = z.object({
	controller: z.object({
		favorite_rides: UserPreferenceValueSchema.extend({
			value: z.array(z.string()),
		}),
	}),
	map: z.object({
		'data:search': UserPreferenceValueSchema.extend({ value: z.string().default('') }),
		'flags:scroll-zoom': UserPreferenceValueSchema.extend({ value: z.boolean().default(true) }),
		'flags:style': UserPreferenceValueSchema.extend({ value: z.string().default('map') }),
	}),
	panes: z.object({}),
	sidebar: z.object({}),
	ui: z.object({
		active_mode: UserPreferenceValueSchema.extend({ value: z.enum(['light', 'dark']) }),
		active_theme: UserPreferenceValueSchema.extend({ value: z.enum(['light', 'dark']) }),
	}),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

