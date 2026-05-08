/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { getValueAtPath } from '@tmlmobilidade/utils';

import styles from './styles.module.css';

import { DataTableColumn } from '../DataTable';

/* * */

interface DataTableRowProps<T = Record<string, unknown>> {

	/**
	 * The column configuration for the row.
	 */
	columns: DataTableColumn<T>[]

	/**
	 * Whether the row is selected.
	 */
	isSelected?: boolean

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
	 * The data record for the row.
	 */
	record: T

}

/* * */

export function DataTableRow<T = Record<string, unknown>>({ columns, isSelected, onRowClick, onRowContextMenu, onRowDoubleClick, record }: DataTableRowProps<T>) {
	return (
		<div
			className={styles.row}
			data-is-clickable={!!onRowClick}
			data-is-selected={isSelected}
			onClick={() => onRowClick?.(record)}
			onContextMenu={() => onRowContextMenu?.(record)}
			onDoubleClick={() => onRowDoubleClick?.(record)}
		>
			{columns.map((column, colIndex) => (
				<div
					key={colIndex}
					className={`${styles.cell} ${column.center ? styles.center : ''}`}
					style={{ maxWidth: column.width, minWidth: column.width, width: column.width }}
				>
					{column.render
						? column.render(record)
						: getValueAtPath(record, column.accessor as any) === null
							? null
							: String(getValueAtPath(record, column.accessor as any))}
				</div>
			))}
		</div>
	);
}
