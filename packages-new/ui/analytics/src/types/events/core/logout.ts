/* * */

import { z } from 'zod';

import { AnalyticsEvent } from '../shared.js';

/* * */

export const LogoutEvent = AnalyticsEvent.extend({
	title: z.literal('go-core-frontend-Logout'),
});

/* * */

export type LogoutEvent = z.infer<typeof LogoutEvent>;
