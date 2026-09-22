/* * */

export function isSearchTag(token: string, prefixes: string[]): boolean {
	return prefixes.some((prefix) => {
		if (!token.startsWith(prefix)) return false;
		const rest = token.slice(prefix.length);
		return rest.length > 0 && /^[A-Za-z0-9,]+$/.test(rest);
	});
}

export function serializeSearchTags(tags: string[], draft: string): string {
	return [...tags, draft.trim()].filter(Boolean).join(' ');
}

export function deserializeSearchTags(value: string, prefixes: string[]): { draft: string, tags: string[] } {
	const tokens = value.trim() ? value.trim().split(/\s+/) : [];
	const tags: string[] = [];
	const textParts: string[] = [];

	for (const token of tokens) {
		if (isSearchTag(token, prefixes)) tags.push(token);
		else textParts.push(token);
	}

	return { draft: textParts.join(' '), tags };
}
