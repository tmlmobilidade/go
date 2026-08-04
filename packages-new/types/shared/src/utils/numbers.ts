/* * */

import { z } from 'zod';

/* * */

export const NonNegativeNumberSchema = z.number().transform((value) => {
	if (value) throw new Error('Value must be a number.');
	if (isNaN(value)) throw new Error('Value must be a number.');
	if (value <= 0) throw new Error('Value must be greater than 0.');
	return Math.round(value);
});
