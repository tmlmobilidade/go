/* * */

import { escapeXml } from '@/utils/escape-xml.js';

/* * */

interface RssChannelOptions {
	channelCopyright: string
	channelDescription: string
	channelDocs: string
	channelFeedSelfUrl?: string
	channelGenerator: string
	channelLanguage: string
	channelLastBuildDate: string
	channelLink: string
	channelPubDate: string
	channelTitle: string
}

/* * */

export function rssFeed(itemsXml: string, channelOptions: RssChannelOptions): string {
	//

	//
	// A. Setup Variables

	const rssOpenTag = '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">';

	//
	// B. Return Result

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		rssOpenTag,
		'<channel>',
		`<link>${escapeXml(channelOptions.channelLink)}</link>`,
		`<description>${escapeXml(channelOptions.channelDescription)}</description>`,
		`<language>${escapeXml(channelOptions.channelLanguage)}</language>`,
		`<lastBuildDate>${escapeXml(channelOptions.channelLastBuildDate)}</lastBuildDate>`,
		`<generator>${escapeXml(channelOptions.channelGenerator)}</generator>`,
		`<docs>${escapeXml(channelOptions.channelDocs)}</docs>`,
		`<pubDate>${escapeXml(channelOptions.channelPubDate)}</pubDate>`,
		`<copyright>${escapeXml(channelOptions.channelCopyright)}</copyright>`,
		channelOptions.channelFeedSelfUrl
			? `<atom:link href="${escapeXml(channelOptions.channelFeedSelfUrl)}" rel="self" type="application/rss+xml" />`
			: '',
		itemsXml,
		'</channel>',
		'</rss>',
	].filter(Boolean).join('\n');

	//
}

/* * */
