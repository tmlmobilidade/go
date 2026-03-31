/* * */

import { escapeXml } from '@/utils/escape-xml.js';

/* * */

interface RssChannelOptions {
	channelCopyright: string
	channelDescription: string
	channelDocs: string
	channelGenerator: string
	channelLanguage: string
	channelLastBuildDate: string
	channelLink: string
	channelPubDate: string
	channelTitle: string
}

export function rssFeedXml(itemsXml: string, channelOptions: RssChannelOptions): string {
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0">',
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
		itemsXml,
		'</channel>',
		'</rss>',
	].join('\n');
}

/* * */
