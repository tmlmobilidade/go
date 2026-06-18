/* * */

import { z } from 'zod';

/* * */

export const ApexValidationStatusValues = [
	'0', // VALID: Contract Valid
	'1', // INVALID: Antipassback
	'2', // INVALID: Card In Black List
	'3', // INVALID: SAM In Black List
	'4', // VALID: Card In White List
	'5', // VALID: Profile In White List
	'6', // VALID: Interchange
	'7', // INVALID: Interrupted
	'8', // INVALID: No Valid Contract
	'9', // INVALID: Card Invalidated
	'10', // INVALID: Events Full
	'11', // INVALID: Not Enough Units
	'12', // INVALID: Contract Expired
	'13', // INVALID: Max Value
] as const;

export const ApexValidationStatusSchema = z.enum(ApexValidationStatusValues);

export type ApexValidationStatus2 = z.infer<typeof ApexValidationStatusSchema>;
