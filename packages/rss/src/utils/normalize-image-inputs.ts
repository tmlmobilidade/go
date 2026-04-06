/* * */

import { type RssRawImageInput } from '@/types/feed.types.js';
import { NormalizedRssImage } from '@/types/normalized-rss-image.js';

/* * */

export function normalizeImageInputs(images: RssRawImageInput[]): NormalizedRssImage[] {
	//

	//
	// A. Setup Variables

	const normalizedImages: NormalizedRssImage[] = [];

	//
	// B. Transform Data

	for (const image of images ?? []) {
		const url = image.url?.trim() ?? '';
		const normalizedImage: NormalizedRssImage = { url };

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
