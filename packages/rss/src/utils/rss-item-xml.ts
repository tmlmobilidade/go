/* * */

import { type RssRawImageInput, type RssRawItem } from '@/types/feed.types.js';
import { escapeXml } from '@/utils/escape-xml.js';

/* * */

/** Inline styles so RSS readers and WebViews render without external CSS. */
const RSS_HEADER_H2_STYLE = 'font-size:1.125rem;font-weight:600;line-height:1.3;margin:0 0 0.5rem';
const RSS_MUTED_LINK_WRAP_STYLE = 'color:#868e96;font-size:0.8125rem;line-height:1.4;margin:0 0 1rem';
const RSS_BODY_P_STYLE = 'margin:0 0 1rem';
const RSS_IMAGE_P_STYLE = 'margin:0 0 0.75rem';
const RSS_IMAGE_STYLE = 'max-width:100%;height:auto';

const DEFAULT_MUTED_LINK_LABEL = 'Ler artigo completo';

function normalizeImageInputs(images: Array<RssRawImageInput> | null | undefined): Array<{ alt?: string, length?: number, type?: string, url: string }> {
	const out: Array<{ alt?: string, length?: number, type?: string, url: string }> = [];
	for (const entry of images ?? []) {
		if (typeof entry === 'string') {
			const url = entry.trim();
			if (url) out.push({ url });
			continue;
		}
		const url = entry.url?.trim() ?? '';
		if (!url) continue;
		const row: { alt?: string, length?: number, type?: string, url: string } = { url };
		if (entry.alt) row.alt = entry.alt;
		if (entry.type) row.type = entry.type;
		if (entry.length != null && Number.isFinite(entry.length)) row.length = Math.floor(entry.length);
		out.push(row);
	}
	return out;
}

function cdataSafe(fragment: string): string {
	return fragment.replace(/\]\]>/g, ']]]]><![CDATA[>');
}

function buildContentEncoded(item: RssRawItem): string {
	if (item.contentHtml) {
		return `<content:encoded><![CDATA[${cdataSafe(item.contentHtml)}]]></content:encoded>`;
	}

	const link = item.link?.trim() ?? '';
	const titleText = item.title?.trim() ?? '';
	const text = (item.description ?? '').trim();
	const bodyHtml = escapeXml(text).replace(/\n/g, '<br />');
	const mutedLabel = item.mutedLinkLabel?.trim() || DEFAULT_MUTED_LINK_LABEL;

	const parts: string[] = [];

	if (titleText) {
		parts.push(`<h2 style="${RSS_HEADER_H2_STYLE}">${escapeXml(titleText)}</h2>`);
	}

	if (link) {
		parts.push(
			`<p style="${RSS_MUTED_LINK_WRAP_STYLE}">`
			+ `<a href="${escapeXml(link)}" style="color:inherit;text-decoration:underline">${escapeXml(mutedLabel)}</a>`
			+ `</p>`,
		);
	}

	if (text) {
		parts.push(`<div style="${RSS_BODY_P_STYLE}">${bodyHtml}</div>`);
	}

	for (const image of normalizeImageInputs(item.images)) {
		const alt = image.alt ? escapeXml(image.alt) : '';
		parts.push(
			`<p style="${RSS_IMAGE_P_STYLE}">`
			+ `<img src="${escapeXml(image.url)}" alt="${alt}" style="${RSS_IMAGE_STYLE}" />`
			+ `</p>`,
		);
	}

	return `<content:encoded><![CDATA[${cdataSafe(parts.join('\n'))}]]></content:encoded>`;
}

export function rssItemXml(item: RssRawItem): string {
	const enclosuresXml = normalizeImageInputs(item.images).map((image) => {
		const lengthAttr = image.length != null ? ` length="${String(image.length)}"` : '';
		const typeAttr = image.type ? ` type="${escapeXml(image.type)}"` : '';
		return `<enclosure url="${escapeXml(image.url)}"${lengthAttr}${typeAttr} />`;
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
