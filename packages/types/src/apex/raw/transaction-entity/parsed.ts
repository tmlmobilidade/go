/* * */

import { z } from 'zod';

import { RawApexValidationV20Schema } from '../validations/validation-v20.js';
import { RawApexValidationV30Schema } from '../validations/validation-v30.js';

/* * */

export const ParsedTransactionEntityV2Schema = z.object({
	_id: z.string(),
	createdAt: z.string(),
	decodeValue: z.discriminatedUnion('_version', [
		RawApexValidationV20Schema,
		RawApexValidationV30Schema,
	]),
	duplicated: z.boolean(),
	isOK: z.boolean(),
	isReprocessed: z.boolean(),
});

/**
 * APEX Validations are APEX transactions of type 11 that are generated when a card holder touches a validator
 * reader (ex: bus validator, subway gate). These validation transactions represent the card holder's right to travel
 * on a given route, line, or vehicle. T11s have statuses that indicate if the card holder was allowed to travel
 * or not, and with which conditions. A validation also contains information about the card holder's card, the vehicle,
 * the validator machine, the route, and the time and location of the validation.
 */
export type ParsedTransactionEntityV2 = z.infer<typeof ParsedTransactionEntityV2Schema>;
