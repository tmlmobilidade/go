/* * */

import { z } from 'zod';

/* * */

export const ApexValidationCategoryValues = [
	'prepaid',
	'subscription',
	'on_board_sale',
] as const;

export const ApexValidationCategorySchema = z.enum(ApexValidationCategoryValues);

export type ApexValidationCategory = z.infer<typeof ApexValidationCategorySchema>;
