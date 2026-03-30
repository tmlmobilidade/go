/* * */

import { type RssRawItem } from '@/types/fetcher.types.js';

/* * */

const NEWS_API_URL = 'https://cmet.pt/admin/api/news';

export async function fetchNewsItems(): Promise<RssRawItem[]> {
	const response = await fetch(NEWS_API_URL);

	if (!response.ok) return [];

	let payload: unknown;

	try {
		payload = await response.json();
	} catch {
		return [];
	}

	if (Array.isArray(payload)) return payload as RssRawItem[];

	if (payload && typeof payload === 'object' && 'docs' in payload && Array.isArray((payload as { docs?: unknown[] }).docs)) {
		return (payload as { docs: RssRawItem[] }).docs;
	}

	return [];
}

/* * */
