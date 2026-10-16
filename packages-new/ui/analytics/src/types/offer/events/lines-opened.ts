/* * */

import { z } from 'zod';

/* * */

export const LinesOpenedEvent = z.object({
	title: z.literal('go-offer-frontend-lines-opened'),
});

/* * */

export type LinesOpenedEvent = z.infer<typeof LinesOpenedEvent>;
