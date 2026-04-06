/* * */

import { RssRawItem } from '@/types/feed.types.js';
import { escapeXml } from '@/utils/escape-xml.js';
import { normalizeImageInputs } from '@/utils/normalize-image-inputs.js';

/* * */

export function buildContentEncoded(item: RssRawItem): string {
	//

	//
	// A. Setup Variables

	const parts: string[] = [];
	const bodyHtml = escapeXml(item.description).replace(/\n/g, '<br />');

	//
	// B. Transform Data

	const cdataSafe = (fragment: string): string => {
		return fragment.replace(/\]\]>/g, ']]]]><![CDATA[>');
	};

	if (item.contentHtml) {
		return `<content:encoded><![CDATA[${cdataSafe(item.contentHtml)}]]></content:encoded>`;
	}

	if (item.description) {
		parts.push(`<div>${bodyHtml}</div>`);
	}

	for (const image of normalizeImageInputs(item.images ?? [])) {
		const alt = image.alt ? escapeXml(image.alt) : '';
		parts.push(
			`<p>`
			+ `<img src="${escapeXml(image.url)}" alt="${alt}" />`
			+ `</p>`,
		);
	}

	if (item.link) {
		parts.push(
			`<p>`
			+ `<a href="${escapeXml(item.link)}">${escapeXml(item.linkLabel ?? 'Ler artigo completo')}</a>`
			+ `</p>`,
		);
	}

	//
	// C. Return Result

	return `<content:encoded><![CDATA[${cdataSafe(parts.join('\n'))}]]></content:encoded>`;

	//
}
