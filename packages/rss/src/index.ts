/* * */

import { type RssFeed } from '@/types/rss-feed.types.js';
import { fetcher } from '@/utils/fetcher.js';

/* * */

export function rssFeed({ type = 'news' }: RssFeed) {
//

	//
	// A.Setup variables

	const xml = await fetcher({ type.toLowerCase() });

	//
	// B.Transform data

	//

	//
	// C.Render components
	return xml;
	//
}
