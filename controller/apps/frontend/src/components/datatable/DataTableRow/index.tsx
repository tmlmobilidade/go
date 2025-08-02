'use client';

/* * */

import { type DataTableColumn } from '@/components/datatable/DataTable';
import { getValueAtPath } from '@tmlmobilidade/utils';

import styles from './styles.module.css';

/* * */

interface DataTableRowProps<T = Record<string, unknown>> {

	/**
	 * The column configuration for the row.
	 */
	columns: DataTableColumn<T>[]

	/**
	 * The data record for the row.
	 */
	record: T

}

/* * */

export function DataTableRow<T = Record<string, unknown>>({ columns, onRowClick, onRowContextMenu, onRowDoubleClick, record }: DataTableRowProps<T> & { onRowClick?: (record: T) => void, onRowContextMenu?: (record: T) => void, onRowDoubleClick?: (record: T) => void }) {
	return (
		<div
			className={styles.row}
			data-is-clickable={!!onRowClick}
			onClick={() => onRowClick && onRowClick(record)}
			onContextMenu={() => onRowContextMenu && onRowContextMenu(record)}
			onDoubleClick={() => onRowDoubleClick && onRowDoubleClick(record)}
		>
			{columns.map((column, colIndex) => (
				<div
					key={colIndex}
					className={styles.cell}
					style={{ maxWidth: column.width, minWidth: column.width, width: column.width }}
				>
					{column.render
						? column.render(record)
						: getValueAtPath(record, column.accessor) === null
							? null
							: String(getValueAtPath(record, column.accessor))}
				</div>
			))}
		</div>
	);
}
