/* * */

import { type RssNormalizedItem, type RssRawItem } from '@/types/fetcher.types.js';
import { fetchNewsItems } from '@/utils/fetcher.js';
import { rssFeedXml } from '@/utils/rss-feed-xml.js';
import { rssItemXml } from '@/utils/rss-item-xml.js';

/* * */

export type { RssRawItem } from '@/types/fetcher.types.js';

export function buildNewsRssXml(rawItems: RssRawItem[], siteOrigin = 'https://cmet.pt'): string {
	const origin = siteOrigin.replace(/\/$/, '');
	const normalizedItems = rawItems.map(item => normalizeNewsItem(item, origin));
	const itemsXml = normalizedItems.map(item => rssItemXml(item)).join('\n');

	return rssFeedXml(itemsXml, 'Carris Metropolitana - Notícias');
}

export async function rssFeed(): Promise<string> {
	const rawItems = await fetchNewsItems();

	return buildNewsRssXml(rawItems);
}

function normalizeNewsItem(item: RssRawItem, siteOrigin: string): RssNormalizedItem {
	const slugOrId = item.slug || item.id || item._id || '';
	const linkFromData = item.link || item.info_url || '';
	const path = `/news/${slugOrId}`;
	const link = linkFromData || `${siteOrigin}${path}`;
	const publishDateSource = item.publishedAt || item.publish_start_date || item.created_at;
	const publishDate = publishDateSource ? new Date(publishDateSource).toUTCString() : undefined;

	return {
		description: item.summary || item.description || '',
		guid: link,
		link,
		publishDate,
		title: item.title || '',
	};
}
