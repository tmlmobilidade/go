export interface TreeSelectSelectionGroup {
	label: string
	parentValue?: string
	selectionLabel?: string
	value: string
	values: string[]
}

/** Synthetic group IDs never leave the picker. Stored values remain regular node IDs. */
export function expandTreeSelectGroups(next: string[], previous: string[], groups: TreeSelectSelectionGroup[]): string[] {
	const groupIds = new Set(groups.map(group => group.value));
	const result = new Set(next.filter(value => !groupIds.has(value)));
	for (const group of groups) {
		const wasSelected = group.values.length > 0 && group.values.every(value => previous.includes(value));
		if (next.includes(group.value) && !wasSelected) group.values.forEach(value => result.add(value));
		if (!next.includes(group.value) && wasSelected) group.values.forEach(value => result.delete(value));
	}
	return [...result];
}
