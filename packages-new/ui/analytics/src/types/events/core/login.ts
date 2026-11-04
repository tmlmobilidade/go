/* * */

import { z } from 'zod';

import { AnalyticsEvent } from '../shared';

/* * */

export const LoginEvent = AnalyticsEvent.extend({
	title: z.literal('go-core-frontend-login'),
});

/* * */

export type LoginEvent = z.infer<typeof LoginEvent>;
