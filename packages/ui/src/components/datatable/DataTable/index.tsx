'use client';

/* * */

import { DataTableContent } from '../DataTableContent';
import { DataTableContextProvider } from '../DataTableContext';

/* * */

export interface DataTableProps<T> {

	/**
	 * The column configuration for the table.
	 */
	columns: DataTableColumn<T>[]

	/**
	 * The maximum height of the table in pixels.
	 * @default 100%
	 */
	maxHeight?: number

	/**
	 * Callback function to handle row click events.
	 * @param record The data record for the clicked row.
	 */
	onRowClick?: (record: T) => void

	/**
	 * Callback function to handle row context menu events.
	 * @param record The data record for the row where the context menu was triggered.
	 */
	onRowContextMenu?: (record: T) => void

	/**
	 * Callback function to handle row double-click events.
	 * @param record The data record for the double-clicked row.
	 */
	onRowDoubleClick?: (record: T) => void

	/**
	 * The data to be displayed in the table.
	 */
	records: T[]

	/**
	 * The id of each table row.
	 */
	rowIdAccessor?: keyof T

	/**
	 * The ID of the row to mark as selected.
	 */
	selectedId?: number | string

	/**
	 * A list of IDs of the rows to mark as selected.
	 */
	selectedIds?: (number | string)[]

	/**
	 * Whether to render the table with a top border.
	 * @default false
	 */
	withTopBorder?: boolean

}

export interface DataTableColumn<T> {

	/**
	 * The row's object property key.
	 */
	accessor: keyof T

	/**
	 * Center the column content.
	 * @default false
	 */
	center?: boolean

	/**
	 * Whether the column is hidden.
	 * @default false
	 */
	hidden?: boolean

	/**
	 * Custom cell data render function.
	 * Accepts the current record and its index in `records` as arguments and returns a React node
	 * (remember that a string is a valid React node too).
	 *
	 * Will override the default render function for this column.
	 */
	render?: (record: T) => React.ReactNode

	/**
	 * Whether the column is sortable.
	 * @default false
	 */
	sortable?: boolean

	/**
	 * The key to be used for sorting.
	 * If not provided, the column accessor will be used.
	 */
	sortKey?: string

	/**
	 * The column header title.
	 */
	title: string

	/**
	 * The width of the column in pixels.
	 */
	width: number

}

/* * */

export function DataTable<T>({ records, ...props }: DataTableProps<T>) {
	return (
		<DataTableContextProvider columns={props.columns} records={records}>
			<DataTableContent {...props} />
		</DataTableContextProvider>
	);
}
