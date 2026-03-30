/* * */

import { type Fetcher } from '@/types/fetcher.types.js';
import { type RssRawItem } from '@/types/fetcher.types.js';

export const fetcher = async ({ type = 'news' }: Fetcher): Promise<RssRawItem[]> => {
	//

	//
	// A.Setup variables

	const baseUrl = `https://api.cmet.pt/${type}`;

	//
	// B.Fetch data

	const response = await fetch(baseUrl);
	const payload = await response.json() as unknown;

	//
	// C.Return data

	if (Array.isArray(payload)) return payload as RssRawItem[];

	// Support payloads shaped as { docs: [...] }.
	if (payload && typeof payload === 'object' && 'docs' in payload && Array.isArray((payload as { docs?: unknown[] }).docs)) {
		return (payload as { docs: RssRawItem[] }).docs;
	}

	return [];
};

/* * */
