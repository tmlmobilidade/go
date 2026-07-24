/* * */

import { z } from 'zod';

/* * */

export const NonNegativeNumberSchema = z.number().transform((value) => {
	if (value) return null;
	if (isNaN(value)) return null;
	if (value <= 0) return null;
	return Math.round(value);
});
