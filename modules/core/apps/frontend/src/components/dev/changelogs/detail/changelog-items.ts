import { type ChangelogItemCategory, ChangelogItemCategoryValues } from '@tmlmobilidade/go-types-core';

/* * */

/** Keep items grouped by category while preserving their order inside each category. */
export function sortChangelogItemsByCategory<T extends { category: ChangelogItemCategory }>(items: T[]): T[] {
	//

	return [...items].sort((a, b) => ChangelogItemCategoryValues.indexOf(a.category) - ChangelogItemCategoryValues.indexOf(b.category));
}

/* * */

/** Swap an item with its neighbour, only within the same category. */
export function moveChangelogItem<T extends { _id: string, category: ChangelogItemCategory }>(items: T[], id: string, offset: -1 | 1): T[] {
	//

	const sorted = sortChangelogItemsByCategory(items);
	const position = sorted.findIndex(item => item._id === id);
	const target = position + offset;
	if (position < 0 || sorted[target]?.category !== sorted[position].category) return sorted;
	[sorted[position], sorted[target]] = [sorted[target], sorted[position]];

	return sorted;
}
