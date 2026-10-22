import { type ComboboxItem, type ComboboxParsedItem, type OptionsFilter } from '@mantine/core';

/* * */

/** Search and alphabetize options before applying the visible limit, preserving groups. */
export const filterSelectOptions: OptionsFilter = ({ limit, options, search }) => {
	const query = search.trim().toLocaleLowerCase();
	const result: ComboboxParsedItem[] = [];
	let remaining = limit;

	const sortedOptions = [...options].sort((left, right) => {
		const leftPinned = 'pinned' in left && left.pinned === true;
		const rightPinned = 'pinned' in right && right.pinned === true;
		if (leftPinned !== rightPinned) return leftPinned ? -1 : 1;
		const leftLabel = 'group' in left ? (typeof left.group === 'string' ? left.group : '') : left.label;
		const rightLabel = 'group' in right ? (typeof right.group === 'string' ? right.group : '') : right.label;
		return leftLabel.localeCompare(rightLabel, undefined, { numeric: true, sensitivity: 'base' });
	});

	for (const option of sortedOptions) {
		if (remaining <= 0) break;
		if ('group' in option) {
			const items = filterSelectOptions({ limit: remaining, options: option.items, search: query });
			const matches = items.flatMap(item => 'group' in item ? item.items : [item]);
			if (matches.length) result.push({ ...option, items: matches });
			remaining -= matches.length;
		} else {
			const metadata: ComboboxItem & { description?: string, keywords?: string } = option;
			const text = `${option.label} ${metadata.description ?? ''} ${metadata.keywords ?? ''}`;
			if (text.toLocaleLowerCase().includes(query)) {
				result.push(option);
				remaining -= 1;
			}
		}
	}

	return result;
};
