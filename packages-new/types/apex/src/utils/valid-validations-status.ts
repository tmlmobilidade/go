/* * */

import { type ApexValidationStatus } from '@/utils/validations-status.js';
import { z } from 'zod';

/* * */

export const ValidApexValidationStatusValues = [
	'0',
	'4',
	'5',
	'6',
] as const satisfies ApexValidationStatus[];

export const ValidApexValidationStatusSchema = z.enum(ValidApexValidationStatusValues);

export type ValidApexValidationStatus = z.infer<typeof ValidApexValidationStatusSchema>;
