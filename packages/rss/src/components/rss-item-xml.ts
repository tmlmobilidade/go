/* * */

import { type RssRawItem } from '@/types/feed.types.js';
import { buildContentEncoded } from '@/utils/build-content-encoded.js';
import { escapeXml } from '@/utils/escape-xml.js';
import { normalizeImageInputs } from '@/utils/normalize-image-inputs.js';

/* * */

export function rssItemXml(item: RssRawItem): string {
	const enclosuresXml = normalizeImageInputs(item.images).map((image, index) => {
		const lengthAttr = image[index].length != null ? ` length="${image[index].length}"` : '';
		const typeAttr = image[index].type ? ` type="${escapeXml(image[index].type)}"` : '';
		return `<enclosure url="${escapeXml(image[index].url)}"${lengthAttr}${typeAttr} />`;
	});

	return [
		'<item>',
		`<title>${escapeXml(item.title)}</title>`,
		`<link>${escapeXml(item.link || '')}</link>`,
		`<guid isPermaLink="true">${escapeXml(item.link || '')}</guid>`,
		item.publishDate ? `<pubDate>${escapeXml(item.publishDate)}</pubDate>` : '',
		`<description>${escapeXml(item.description)}</description>`,
		buildContentEncoded(item),
		enclosuresXml.length ? enclosuresXml.join('\n') : '',
		'</item>',
	].filter(Boolean).join('\n');
}

/* * */
