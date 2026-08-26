/* * */

import { z } from 'zod';

/* * */

export const NonNegativeNumberSchema = z.number().transform((value) => {
	if (!Number.isFinite(value)) throw new Error('Value must be a number.');
	if (value < 0) throw new Error('Value must be greater than or equal to 0.');
	return Math.round(value);
});
