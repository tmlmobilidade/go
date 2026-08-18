import { type ReactNode } from 'react';

/* * */

export type DataTableV2SortDirection = 'asc' | 'desc';
export type DataTableV2SortValue = null | number | string | undefined;
export type DataTableV2ColumnWidth = `${number}%`;

export interface DataTableV2SortState {
	columnId: string
	direction: DataTableV2SortDirection
}

export interface DataTableV2Column<T> {
	align?: 'center' | 'left' | 'right'
	id: string
	render: (record: T) => ReactNode
	sortable?: boolean
	sortDirection?: DataTableV2SortDirection
	sortValue?: (record: T) => DataTableV2SortValue
	title: ReactNode
	width: DataTableV2ColumnWidth
}

export interface DataTableV2PaginationRange {
	end: number
	start: number
	total: number
}

export interface DataTableV2PaginationOptions {
	defaultPageSize: number
	pageSizeLabel: ReactNode
	pageSizeOptions: number[]
	rangeLabel: (range: DataTableV2PaginationRange) => ReactNode
	resetKey?: number | string
}

export interface DataTableV2Props<T> {
	ariaLabel?: string
	className?: string
	columns: DataTableV2Column<T>[]
	emptyState?: ReactNode
	getRowId: (record: T) => number | string
	initialSort?: DataTableV2SortState
	isLoading?: boolean
	loadingRows?: number
	pagination?: DataTableV2PaginationOptions
	records: T[]
	rowClassName?: (record: T) => string | undefined
}
