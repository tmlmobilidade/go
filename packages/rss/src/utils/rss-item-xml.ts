/* * */

import { type RssNormalizedItem } from '@/types/fetcher.types.js';
import { escapeXml } from '@/utils/escape-xml.js';

/* * */

export function rssItemXml(item: RssNormalizedItem): string {
	return [
		'<item>',
		`<title>${escapeXml(item.title)}</title>`,
		`<link>${escapeXml(item.link)}</link>`,
		`<guid isPermaLink="true">${escapeXml(item.guid)}</guid>`,
		item.pubDate ? `<pubDate>${escapeXml(item.pubDate)}</pubDate>` : '',
		`<description>${escapeXml(item.description)}</description>`,
		'</item>',
	].filter(Boolean).join('\n');
}

/* * */
