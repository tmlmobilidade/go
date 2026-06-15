/* * */

import { z } from 'zod';

/* * */

export const TtsSchema = z.object({
	_id: z.string(),
	url: z.string(),
});

export type Tts = z.infer<typeof TtsSchema>;
