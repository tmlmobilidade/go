/* * */

import { z } from 'zod';

/* * */

export const BannerLinkSchema = z.object({
	label: z.string().trim().min(1),
	url: z.string().url().regex(/^https?:\/\//i, 'Banner links must use HTTP or HTTPS'),
});

export type BannerLink = z.infer<typeof BannerLinkSchema>;
