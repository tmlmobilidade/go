/* * */

import { z } from 'zod';

import { AnalyticsEvent } from '../shared';

/* * */

export const LinesOpenedEvent = AnalyticsEvent.extend({
	title: z.literal('go-offer-frontend-lines-opened'),
});

/* * */

export type LinesOpenedEvent = z.infer<typeof LinesOpenedEvent>;
