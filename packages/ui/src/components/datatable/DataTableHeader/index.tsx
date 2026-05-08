'use client';

import { ActionIcon } from '@mantine/core';
import { IconArrowDownRhombus, IconArrowsUpDown, IconArrowUpRhombus } from '@tabler/icons-react';

import styles from './styles.module.css';

import { DataTableColumn } from '../DataTable';
import { useDataTableContext } from '../DataTableContext';

/* * */

interface DataTableHeaderProps<T = Record<string, unknown>> {

	/**
	 * The columns to be displayed in the table header.
	 */
	columns: DataTableColumn<T>[]

	/**
	 * Whether to render the table header with a top border.
	 * @default false
	 */
	withTopBorder?: boolean

}

/* * */

export function DataTableHeader<T = Record<string, unknown>>({ columns, withTopBorder }: DataTableHeaderProps<T>) {
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
		<div className={styles.header} data-with-top-border={withTopBorder}>
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
