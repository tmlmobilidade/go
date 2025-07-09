'use client';

/* * */

import { DataTableColumn } from '@/components/datatable/datatable.type';
import { useDataTableContext } from '@/components/datatable/DataTableContext';
import { IconArrowDownRhombus, IconArrowsUpDown, IconArrowUpRhombus } from '@tabler/icons-react';
import { ActionIcon } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface DataTableHeaderProps<T = Record<string, unknown>> {
	/**
	 * The columns to be displayed in the table header.
	 */
	columns: DataTableColumn<T>[]
}

/* * */

export function DataTableHeader<T = Record<string, unknown>>({ columns }: DataTableHeaderProps<T>) {
	//

	//
	// A. Setup variables

	const dataTableContext = useDataTableContext<T>();

	//
	// B. Render components

	const renderSortIcon = (column: DataTableColumn<T>) => {
		if (!column.sortable) return null;
		return (
			<ActionIcon variant="muted">
				{dataTableContext.filters.sort_state?.accessor === column.accessor ? (
					dataTableContext.filters.sort_state.order === 'asc' ? (
						<IconArrowUpRhombus size={18} />
					) : dataTableContext.filters.sort_state.order === 'desc' ? (
						<IconArrowDownRhombus size={18} />
					) : (
						<IconArrowsUpDown size={18} />
					)
				) : (
					<IconArrowsUpDown size={18} />
				)}
			</ActionIcon>
		);
	};

	return (
		<div className={styles.header}>
			{columns.map((column, idx) => (
				<div
					key={idx}
					className={styles.cell}
					style={{
						maxWidth: column.width,
						minWidth: column.width ?? 'max-content',
					}}
				>
					<div
						className={styles.cellContent}
						data-center={column.center}
						onClick={() =>
							column.sortable
							&& dataTableContext.actions.handleSort(column.sortKey ?? String(column.accessor))}
					>
						{column.title}
						{column.sortable && renderSortIcon(column)}
					</div>
				</div>
			))}
		</div>
	);

	//
}
