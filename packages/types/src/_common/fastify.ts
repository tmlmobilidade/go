/* * */

import { z } from 'zod';

/* * */

export const PaginationSchema = z.object({
	limit: z.coerce.number().min(1).default(100),
	page: z.coerce.number().min(1).default(1),
});
