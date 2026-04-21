/* * */

import { type RssRawItem } from '@/types/feed.types.js';
import { buildContentEncoded } from '@/utils/build-content-encoded.js';
import { escapeXml } from '@/utils/escape-xml.js';
import { normalizeImageInputs } from '@/utils/normalize-image-inputs.js';

/* * */

export function rssFeedItem(item: RssRawItem): string {
	//

	//
	// A. Transform Data

	const enclosuresXml = normalizeImageInputs(item.images ?? []).map((image) => {
		const lengthAttr = image.length != null ? ` length="${String(image.length)}"` : '';
		const typeAttr = image.type ? ` type="${escapeXml(image.type)}"` : '';
		return `<enclosure url="${escapeXml(image.url)}"${lengthAttr}${typeAttr} />`;
	});

	//
	// B. Return Result

	return [
		'<item>',
		`<title>${escapeXml(item.title || '')}</title>`,
		`<link>${escapeXml(item.link || '')}</link>`,
		`<guid isPermaLink="true">${escapeXml(item.link || '')}</guid>`,
		item.publishDate ? `<pubDate>${escapeXml(item.publishDate)}</pubDate>` : '',
		`<description>${escapeXml(item.description)}</description>`,
		buildContentEncoded(item),
		enclosuresXml.length ? enclosuresXml.join('\n') : '',
		'</item>',
	].filter(Boolean).join('\n');

	//
}

/* * */
