/* * */

import { validationMessage } from '@tmlmobilidade/go-utils-validation';
import { z } from 'zod';

/* * */

export const BannerLinkSchema = z.object({
	label: z.string().trim().min(1),
	url: z.string().url().regex(/^https?:\/\//i, { error: validationMessage('custom.banner.link') }),
});

export type BannerLink = z.infer<typeof BannerLinkSchema>;
