/* * */

import { z } from 'zod';

/* * */

export const ExtractionTaskContextSchema = z.object({
	attachment_name: z.string(),
	output_path: z.string(),
});

export type ExtractionTaskContext = z.infer<typeof ExtractionTaskContextSchema>;
