/* * */

import { type RssRawImageInput } from '@/types/feed.types.js';

/* * */

export function normalizeImageInputs(images: RssRawImageInput[]) {
	//

	//
	// A. Setup Variables

	const normalizedImages: RssRawImageInput[] = [];

	//
	// B. Transform Data

	for (const image of images ?? []) {
		if (typeof image === 'string') {
			const url = image.trim();
			if (url) normalizedImages.push({ url });
			continue;
		}

		const url = image.url?.trim() ?? '';
		const normalizedImage: { alt?: string, length?: number, type?: string, url: string } = { url };

		if (!url) continue;
		if (image.alt) normalizedImage.alt = image.alt;
		if (image.type) normalizedImage.type = image.type;
		if (image.length != null && Number.isFinite(image.length)) normalizedImage.length = Math.floor(image.length);

		normalizedImages.push(normalizedImage);
	}

	//
	// C. Return Result

	return normalizedImages;

	//
}
