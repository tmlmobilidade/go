'use client';

/* * */

import { IconArrowDown, IconArrowsSort, IconArrowUp } from '@tabler/icons-react';
import clsx from 'clsx';
import { type CSSProperties, useEffect, useMemo, useState } from 'react';

import styles from './styles.module.css';

import { Skeleton } from '../../common/Skeleton';
import { Pagination } from '../../display/Pagination';
import { Select } from '../../inputs/Select';
import { sortDataTableV2Records } from './sort-records';
import { type DataTableV2Column, type DataTableV2Props } from './types';

/* * */

export type { DataTableV2Column, DataTableV2ColumnWidth, DataTableV2PaginationOptions, DataTableV2PaginationRange, DataTableV2Props, DataTableV2SortDirection, DataTableV2SortState, DataTableV2SortValue } from './types';

/* * */

function getSortIcon<T>(column: DataTableV2Column<T>, activeColumnId?: string, direction?: 'asc' | 'desc') {
	if (column.id !== activeColumnId) return IconArrowsSort;
	return direction === 'asc' ? IconArrowUp : IconArrowDown;
}

/* * */

export function DataTableV2<T>({ ariaLabel, className, columns, emptyState, getRowId, initialSort, isLoading = false, loadingRows, pagination, records, rowClassName }: DataTableV2Props<T>) {
	//

	//
	// A. Setup variables

	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(pagination?.defaultPageSize ?? Math.max(records.length, 1));
	const [sortState, setSortState] = useState(initialSort ?? null);

	//
	// B. Transform data

	const sortedRecords = useMemo(
		() => sortDataTableV2Records(records, columns, sortState),
		[columns, records, sortState],
	);
	const totalPages = pagination ? Math.max(1, Math.ceil(sortedRecords.length / pageSize)) : 1;
	const activePage = Math.min(page, totalPages);
	const pageOffset = pagination ? (activePage - 1) * pageSize : 0;
	const displayedRecords = pagination ? sortedRecords.slice(pageOffset, pageOffset + pageSize) : sortedRecords;
	const paginationRange = {
		end: pageOffset + displayedRecords.length,
		start: displayedRecords.length ? pageOffset + 1 : 0,
		total: sortedRecords.length,
	};
	const pageSizeData = pagination?.pageSizeOptions.map(value => ({ label: String(value), value: String(value) })) ?? [];
	const loadingRowCount = Math.max(1, loadingRows ?? pagination?.defaultPageSize ?? 5);

	//
	// C. Sync state

	useEffect(() => {
		setPage(1);
	}, [pagination?.resetKey]);

	//
	// D. Handle actions

	const handleSort = (column: DataTableV2Column<T>) => {
		if (!column.sortable || !column.sortValue) return;
		const firstDirection = column.sortDirection ?? 'desc';
		const secondDirection = firstDirection === 'desc' ? 'asc' : 'desc';
		setPage(1);
		setSortState((current) => {
			if (current?.columnId !== column.id) return { columnId: column.id, direction: firstDirection };
			if (current.direction === firstDirection) return { columnId: column.id, direction: secondDirection };
			return null;
		});
	};

	const handlePageSizeChange = (value: null | string) => {
		if (!value) return;
		setPage(1);
		setPageSize(Number(value));
	};

	//
	// E. Render components

	return (
		<div className={styles.root}>
			<div className={styles.scrollArea}>
				<table aria-busy={isLoading} aria-label={ariaLabel} className={clsx(styles.table, className)}>
					<colgroup>
						{columns.map(column => (
							<col key={column.id} style={{ width: column.width } as CSSProperties} />
						))}
					</colgroup>
					<thead>
						<tr>
							{columns.map((column) => {
								const isActive = sortState?.columnId === column.id;
								const SortIcon = getSortIcon(column, sortState?.columnId, sortState?.direction);
								const ariaSort = isActive ? (sortState.direction === 'asc' ? 'ascending' : 'descending') : 'none';

								return (
									<th key={column.id} aria-sort={column.sortable ? ariaSort : undefined} data-align={column.align ?? 'left'}>
										{column.sortable ? (
											<button className={styles.sortButton} onClick={() => handleSort(column)} type="button">
												<span>{column.title}</span>
												<SortIcon aria-hidden="true" size={16} />
											</button>
										) : column.title}
									</th>
								);
							})}
						</tr>
					</thead>
					<tbody>
						{isLoading
							? Array.from({ length: loadingRowCount }, (_, rowIndex) => (
								<tr key={`loading-${rowIndex}`} className={styles.loadingRow}>
									{columns.map(column => (
										<td key={column.id} data-align={column.align ?? 'left'}>
											<Skeleton className={styles.skeleton} />
										</td>
									))}
								</tr>
							))
							: displayedRecords.map(record => (
								<tr key={getRowId(record)} className={rowClassName?.(record)}>
									{columns.map(column => (
										<td key={column.id} data-align={column.align ?? 'left'}>{column.render(record)}</td>
									))}
								</tr>
							))}
						{!isLoading && displayedRecords.length === 0 && emptyState && (
							<tr><td className={styles.empty} colSpan={columns.length}>{emptyState}</td></tr>
						)}
					</tbody>
				</table>
			</div>

			{pagination && !isLoading && sortedRecords.length > 0 && (
				<footer className={styles.footer}>
					<div className={styles.range}>{pagination.rangeLabel(paginationRange)}</div>
					<label className={styles.pageSize}>
						<span>{pagination.pageSizeLabel}</span>
						<span className={styles.pageSizeSelect}>
							<Select
								aria-label={typeof pagination.pageSizeLabel === 'string' ? pagination.pageSizeLabel : undefined}
								clearable={false}
								data={pageSizeData}
								onChange={handlePageSizeChange}
								searchable={false}
								value={String(pageSize)}
								classNames={{
									root: styles.pageSizeSelectRoot,
									wrapper: styles.pageSizeSelectInputWrapper,
								}}
							/>
						</span>
					</label>
					{totalPages > 1 && (
						<div className={styles.pagination}>
							<Pagination onChange={setPage} total={totalPages} value={activePage} />
						</div>
					)}
				</footer>
			)}
		</div>
	);

	//
}
