/* * */

import { z } from 'zod';

import { AnalyticsEvent } from '../shared';

/* * */

export const LoginOpenedEvent = AnalyticsEvent.extend({
	title: z.literal('go-core-frontend-login-opened'),
});

/* * */

export type LoginOpenedEvent = z.infer<typeof LoginOpenedEvent>;
