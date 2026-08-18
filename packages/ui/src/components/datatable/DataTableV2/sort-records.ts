import { type DataTableV2Column, type DataTableV2SortState, type DataTableV2SortValue } from './types';

/* * */

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

function compareValues(a: DataTableV2SortValue, b: DataTableV2SortValue) {
	if (typeof a === 'number' && typeof b === 'number') return a - b;
	return collator.compare(String(a), String(b));
}

export function sortDataTableV2Records<T>(
	records: T[],
	columns: DataTableV2Column<T>[],
	sortState: DataTableV2SortState | null,
) {
	if (!sortState) return records;
	const column = columns.find(item => item.id === sortState.columnId);
	if (!column?.sortable || !column.sortValue) return records;

	return records
		.map((record, index) => ({ index, record }))
		.sort((a, b) => {
			const aValue = column.sortValue?.(a.record);
			const bValue = column.sortValue?.(b.record);
			const aIsMissing = aValue === null || aValue === undefined;
			const bIsMissing = bValue === null || bValue === undefined;
			if (aIsMissing || bIsMissing) {
				if (aIsMissing && bIsMissing) return a.index - b.index;
				return aIsMissing ? 1 : -1;
			}

			const comparison = compareValues(aValue, bValue);
			if (comparison === 0) return a.index - b.index;
			return sortState.direction === 'asc' ? comparison : -comparison;
		})
		.map(item => item.record);
}
