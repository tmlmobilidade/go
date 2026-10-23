/* * */

import { FareSchema } from '@tmlmobilidade/go-types-offer';
import { z } from 'zod';

/* * */

/** Fare metadata required to select a typology's default fares. */
export const TypologiesFareItemSchema = FareSchema.pick({
	_id: true,
	name: true,
	payment_method: true,
});

export type TypologiesFareItem = z.infer<typeof TypologiesFareItemSchema>;
