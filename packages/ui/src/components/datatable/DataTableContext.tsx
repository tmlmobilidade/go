/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { getValueAtPath } from '@tmlmobilidade/utils';
import { createContext, type PropsWithChildren, type RefObject, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { type ViewportListRef } from 'react-viewport-list';

import { tryParseDateToTimestamp } from '../../lib/utils';
import { type DataTableColumn } from './DataTable';

/* * */

interface DataTableContextState<T> {
	actions: {
		handleSort: (accessor: string) => void
		handleUpdateColumnWidth: (column: string, width: number) => void
	}
	data: {
		column_widths?: Record<string, number>
		records: T[]
	}
	filters: {
		sort_state: null | SortState
	}
	refs: {
		list: RefObject<null | ViewportListRef>
	}
}

// Define the props for the provider component
interface DataTableProviderProps<T> {
	columns: DataTableColumn<T>[]
	records: T[]
}

// Define the types for sorting and filtering
type SortOrder = 'asc' | 'desc' | null;

interface SortState {
	accessor: string
	order: SortOrder
}

/* * */

const DataTableContext = createContext<DataTableContextState<unknown> | undefined>(undefined);

export function useDataTableContext<T>(): DataTableContextState<T> {
	const context = useContext(DataTableContext);
	if (!context) {
		throw new Error('useDataTableContext must be used within a DataTableContextProvider');
	}
	return context as DataTableContextState<T>;
}

/* * */

export function DataTableContextProvider<T>({ children, columns, records }: PropsWithChildren<DataTableProviderProps<T>>) {
	//

	//
	// A. Setup variables

	const listRef = useRef<null | ViewportListRef>(null);

	const [sortState, setSortState] = useState<DataTableContextState<T>['filters']['sort_state']>(null);
	const [columnWidths, setColumnWidths] = useState<DataTableContextState<T>['data']['column_widths']>({});

	//
	// B. Transform data

	const sortedRecords = useMemo(() => {
		if (!sortState) return records;
		// Sort Data
		const { accessor, order } = sortState;

		const sortFn = (a: number | string, b: number | string) => {
			if (a < b) return order === 'asc' ? -1 : 1;
			if (a > b) return order === 'asc' ? 1 : -1;
			return 0;
		};

		return records.sort((a, b) => {
			const aValue = getValueAtPath(a, accessor as any) ?? '';
			const bValue = getValueAtPath(b, accessor as any) ?? '';

			// Validate if type is sortable
			if (![typeof aValue, typeof bValue].every(type => type === 'string' || type === 'number')) {
				console.warn(`Sorting key: "${accessor}" is not sortable`);
				return 0;
			}

			const aTimestamp = typeof aValue === 'string' ? tryParseDateToTimestamp(aValue) : null;
			const bTimestamp = typeof bValue === 'string' ? tryParseDateToTimestamp(bValue) : null;

			if (aTimestamp && bTimestamp) {
				return sortFn(aTimestamp, bTimestamp);
			}

			return sortFn(aValue as number | string, bValue as number | string);
		});
	}, [records, sortState]);

	useEffect(() => {
		// Set initial column widths
		const initialWidths: Record<string, number> = {};
		columns.forEach((column) => {
			if (column.width) {
				initialWidths[String(column.accessor)] = column.width;
			}
		});
		setColumnWidths(initialWidths);
	}, [columns]);

	//
	// C. Handle actions

	const handleSort = useCallback((accessor: string) => {
		if (sortState?.accessor === accessor) {
			const newOrder = sortState.order === 'asc' ? 'desc' : sortState.order === 'desc' ? null : 'asc';
			setSortState(newOrder ? { accessor, order: newOrder } : null);
		} else {
			setSortState({ accessor, order: 'asc' });
		}
	}, [sortState]);

	const handleUpdateColumnWidth = useCallback((column: string, width: number) => {
		setColumnWidths(prev => ({
			...prev,
			[column]: width,
		}));
	}, []);

	//
	// D. Define context value

	const contextValue: DataTableContextState<T> = useMemo(() => ({
		actions: {
			handleSort,
			handleUpdateColumnWidth,
		},
		data: {
			column_widths: columnWidths,
			records: sortedRecords ?? [],
		},
		filters: {
			sort_state: sortState,
		},
		refs: {
			list: listRef,
		},
	}), [
		listRef,
		columnWidths,
		sortedRecords,
		sortState,
	]);

	//
	// E. Render components

	return (
		<DataTableContext.Provider value={contextValue}>
			{children}
		</DataTableContext.Provider>
	);

	//
};
