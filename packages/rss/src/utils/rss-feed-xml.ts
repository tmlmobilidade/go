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

export function rssFeedXml(itemsXml: string, channelOptions: RssChannelOptions): string {
	const rssOpenTag = '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">';

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		rssOpenTag,
		'<channel>',
		`<title>${escapeXml(channelOptions.channelTitle)}</title>`,
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
}

/* * */
