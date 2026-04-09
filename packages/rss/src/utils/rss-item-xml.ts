/* * */

import { type RssRawItem } from '@/types/feed.types.js';
import { escapeXml } from '@/utils/escape-xml.js';

/* * */

export function rssItemXml(item: RssRawItem): string {
	return [
		'<item>',
		`<title>${escapeXml(item.title)}</title>`,
		`<link>${escapeXml(item.link || '')}</link>`,
		`<guid isPermaLink="true">${escapeXml(item.link || '')}</guid>`,
		item.publishDate ? `<pubDate>${escapeXml(item.publishDate)}</pubDate>` : '',
		`<description>${escapeXml(item.description)}</description>`,
		'</item>',
	].filter(Boolean).join('\n');
}

/* * */
