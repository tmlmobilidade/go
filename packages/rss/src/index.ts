/* * */

import type { CreateRssFeedOptions, RssRawItem } from '@/types/index.js';

import { rssFeedItem } from '@/components/RSSFeedItem/index.js';
import { rssFeed } from '@/components/RssXML/index.js';

/* * */

export type { RssRawImageInput } from '@/types/index.js';

/* * */

export function createRssFeed(rawItems: RssRawItem[], options: CreateRssFeedOptions): string {
	//

	//
	// A. Create XML items

	const itemsXml = rawItems.map(item => rssFeedItem({
		contentHtml: item.contentHtml,
		description: item.summary || item.description || '',
		images: item.images,
		link: item.link || '',
		linkLabel: item.linkLabel,
		publishDate: item.publishDate || item.publish_start_date || item.created_at ? new Date(item.publishDate || item.publish_start_date || item.created_at).toUTCString() : undefined,
		title: item.title || '',
	})).join('\n');

	//
	// B. Create and return XML feed

	const now = new Date().toUTCString();
	return rssFeed(itemsXml, {
		channelCopyright: options.copyright,
		channelDescription: options.description,
		channelDocs: 'https://www.rssboard.org/rss-specification',
		channelFeedSelfUrl: options.feedSelfUrl,
		channelGenerator: '@tmlmobilidade/rss',
		channelLanguage: 'pt-pt',
		channelLastBuildDate: now,
		channelLink: options.link,
		channelPubDate: now,
		channelTitle: options.title,
	});

	//
}
