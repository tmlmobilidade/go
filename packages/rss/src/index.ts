/* * */

import { type RssFeedType, type RssNormalizedItem, type RssRawItem } from '@/types/fetcher.types.js';
import { type RssFeed } from '@/types/rss-feed.types.js';
import { fetcher } from '@/utils/fetcher.js';
import { rssFeedXml } from '@/utils/rss-feed-xml.js';
import { rssItemXml } from '@/utils/rss-item-xml.js';

/* * */

export async function rssFeed({ type = 'news' }: RssFeed) {
	//

	//
	// A.Setup variables

	const rawItems = await fetcher({ type: type.toLowerCase() as RssFeedType });

	//
	// B.Transform data

	const normalizedItems = rawItems.map(item => normalizeRssItem(item, type));
	const itemsXml = normalizedItems.map(item => rssItemXml(item)).join('\n');
	const xml = rssFeedXml(itemsXml, `Carris Metropolitana - ${type}`);

	//
	// C.Return XML

	return xml;

	//
}

function normalizeRssItem(item: RssRawItem, type: RssFeedType): RssNormalizedItem {
	const slugOrId = item.slug || item.id || item._id || '';
	const linkFromData = item.link || item.info_url || '';
	const fallbackPath = type === 'news' ? `/news/${slugOrId}` : `/alerts/${slugOrId}`;
	const link = linkFromData || `https://api.cmet.pt${fallbackPath}`;

	const pubDateSource = item.publishedAt || item.publish_start_date || item.created_at;
	const pubDate = pubDateSource ? new Date(pubDateSource).toUTCString() : undefined;

	return {
		description: item.summary || item.description || '',
		guid: link,
		link,
		pubDate,
		title: item.title || '',
	};
}
