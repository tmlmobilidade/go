/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { getValueAtPath } from '@tmlmobilidade/utils';
import { ViewportList } from 'react-viewport-list';

import { DataTableProps } from '../DataTable';
import { useDataTableContext } from '../DataTableContext';
import { DataTableEmptyState } from '../DataTableEmptyState';
import { DataTableHeader } from '../DataTableHeader';
import { DataTableLoading } from '../DataTableLoading';
import { DataTableRow } from '../DataTableRow';

/* * */

type DataTableContentProps<T> = Omit<DataTableProps<T>, 'records'>;

/* * */

export function DataTableContent<T>({ columns, isLoading, onRowClick, onRowContextMenu, onRowDoubleClick, rowIdAccessor, selectedId, selectedIds, withTopBorder }: DataTableContentProps<T>) {
	//

	//
	// A. Setup variables

	const dataTableContext = useDataTableContext<T>();

	//
	// B. Transform data

	const isSelected = (record: T) => {
		if (rowIdAccessor && selectedId) return getValueAtPath(record, rowIdAccessor as any) === selectedId;
		if (rowIdAccessor && selectedIds?.length) return selectedIds.includes(getValueAtPath(record, rowIdAccessor as any) as string);
		return false;
	};

	//
	// C. Render components

	if (isLoading) {
		return <DataTableLoading />;
	}

	if (!dataTableContext.data.records.length) {
		return <DataTableEmptyState />;
	}

	return (
		<>
			<DataTableHeader columns={columns} withTopBorder={withTopBorder} />
			<ViewportList
				ref={dataTableContext.refs.list}
				itemMargin={0}
				items={dataTableContext.data.records}
			>
				{(record, rowIndex) => (
					<DataTableRow
						key={rowIdAccessor ? (getValueAtPath(record, rowIdAccessor as any) as string) : rowIndex}
						columns={columns}
						isSelected={isSelected(record)}
						onRowClick={onRowClick}
						onRowContextMenu={onRowContextMenu}
						onRowDoubleClick={onRowDoubleClick}
						record={record}
					/>
				)}
			</ViewportList>
		</>
	);
}
