/* * */

import { type CreateRssFeedOptions, type RssRawItem } from '@/types/index.js';
import { rssFeedXml, rssItemXml } from '@/utils/index.js';

/* * */

export function createRssFeed(rawItems: RssRawItem[], options: CreateRssFeedOptions): string {
	//

	//
	// A. Create XML items

	const itemsXml = rawItems.map(item => rssItemXml({
		description: item.summary || item.description || '',
		link: item.link || '',
		publishDate: item.publishDate || item.publish_start_date || item.created_at ? new Date(item.publishDate || item.publish_start_date || item.created_at).toUTCString() : undefined,
		title: item.title || '',
	})).join('\n');

	//
	// B. Create adn return XML feed

	const now = new Date().toUTCString();
	return rssFeedXml(itemsXml, {
		channelCopyright: options.copyright,
		channelDescription: options.description,
		channelDocs: 'https://www.rssboard.org/rss-specification',
		channelGenerator: '@tmlmobilidade/rss',
		channelLanguage: 'pt-pt',
		channelLastBuildDate: now,
		channelLink: options.link,
		channelPubDate: now,
		channelTitle: options.title,
	});

	//
}
