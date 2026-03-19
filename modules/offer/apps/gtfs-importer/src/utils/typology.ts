/* * */

import { Typology } from '@tmlmobilidade/types';

export function normalizeHexColor(value?: null | string) {
	if (!value) return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
	return normalized.toUpperCase();
}

export function buildTypologyColorMap(typologies: Typology[]) {
	const map = new Map<string, Typology>();
	for (const typology of typologies) {
		const color = normalizeHexColor(typology.color);
		if (!color) continue;
		if (!map.has(color)) map.set(color, typology);
	}
	return map;
}
