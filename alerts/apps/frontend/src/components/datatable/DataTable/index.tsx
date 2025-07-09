'use client';

/* * */

import { type DataTableColumn } from '@/components/datatable/datatable.type';
import { DataTableContent } from '@/components/datatable/DataTableContent';
import { DataTableContextProvider } from '@/components/datatable/DataTableContext';

/* * */

export interface DataTableProps<T> {

	/**
	 * The classnames to be applied to the table.
	 */
	classnames?: Partial<
		Record<'body' | 'cell' | 'footer' | 'header' | 'root' | 'row' | 'table' | 'tableWrapper', string>
	>

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
	 * @param record - The data record for the clicked row.
	 */
	onRowClick?: (record: T) => void

	/**
	 * Callback function to handle row context menu events.
	 * @param record - The data record for the row where the context menu was triggered.
	 */
	onRowContextMenu?: (record: T) => void

	/**
	 * Callback function to handle row double-click events.
	 * @param record - The data record for the double-clicked row.
	 */
	onRowDoubleClick?: (record: T) => void

	/**
	 * The data to be displayed in the table.
	 */
	records: T[]

	/**
	 * The id of each table row.
	 */
	rowIdAccessor?: keyof T | (string & {})

}

/* * */

export function DataTable<T>({ records, ...props }: DataTableProps<T>) {
	return (
		<DataTableContextProvider columns={props.columns} records={records}>
			<DataTableContent {...props} />
		</DataTableContextProvider>
	);
}
