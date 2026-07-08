/* * */

import { z } from 'zod';

/* * */

export const SeverityEnumSchema = z.enum([
	'error',
	'forbidden',
	'ignore',
	'warning',
]);

export type Severity = z.infer<typeof SeverityEnumSchema>;
