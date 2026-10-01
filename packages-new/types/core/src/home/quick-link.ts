/* * */

import { z } from 'zod';

/* * */

export const HomeQuickLinkSchema = z.object({
	href: z.string().url(),
	icon: z.string(),
	order: z.number().min(0),
	title: z.string(),
});

export type HomeQuickLink = z.infer<typeof HomeQuickLinkSchema>;
