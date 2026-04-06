/* * */

import { type RssRawImageInput } from '@/types/feed.types.js';

/* * */

export function normalizeImageInputs(images: Array<RssRawImageInput> | null | undefined): Array<{ alt?: string, length?: number, type?: string, url: string }> {
	//

	//
	// A. Setup Variables

	const out: Array<{ alt?: string, length?: number, type?: string, url: string }> = [];

	//
	// B. Transform Data

	for (const entry of images ?? []) {
		if (typeof entry === 'string') {
			const url = entry.trim();
			if (url) out.push({ url });
			continue;
		}

		const url = entry.url?.trim() ?? '';
		const row: { alt?: string, length?: number, type?: string, url: string } = { url };

		if (!url) continue;
		if (entry.alt) row.alt = entry.alt;
		if (entry.type) row.type = entry.type;
		if (entry.length != null && Number.isFinite(entry.length)) row.length = Math.floor(entry.length);

		out.push(row);
	}

	//
	// C. Return Result

	return out;

	//
}
