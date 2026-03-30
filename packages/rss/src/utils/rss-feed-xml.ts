/* * */

import { escapeXml } from '@/utils/escape-xml.js';

/* * */

export function rssFeedXml(itemsXml: string, channelTitle: string): string {
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0">',
		'<channel>',
		`<title>${escapeXml(channelTitle)}</title>`,
		itemsXml,
		'</channel>',
		'</rss>',
	].join('\n');
}

/* * */
