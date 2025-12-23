'use client';

/* * */

import { getValueAtPath } from '@tmlmobilidade/utils';
import { ViewportList } from 'react-viewport-list';

import { DataTableProps } from '../DataTable';
import { useDataTableContext } from '../DataTableContext';
import { DataTableHeader } from '../DataTableHeader';
import { DataTableRow } from '../DataTableRow';

/* * */

type Props<T> = Omit<DataTableProps<T>, 'records'>;

/* * */

export function DataTableContent<T>({ columns, onRowClick, onRowContextMenu, onRowDoubleClick, rowIdAccessor, selectedId, selectedIds }: Props<T>) {
	//

	//
	// A. Setup variables

	const dataTableContext = useDataTableContext<T>();

	//
	// B. Transform data

	const isSelected = (record: T) => {
		if (rowIdAccessor && selectedId) return getValueAtPath(record, rowIdAccessor) === selectedId;
		if (rowIdAccessor && selectedIds?.length) return selectedIds.includes(getValueAtPath(record, rowIdAccessor) as string);
		return false;
	};

	//
	// C. Render components

	return (
		<>
			<DataTableHeader columns={columns} />
			<ViewportList
				ref={dataTableContext.refs.list}
				itemMargin={0}
				items={dataTableContext.data.records}
			>
				{(record, rowIndex) => (
					<DataTableRow
						key={rowIdAccessor ? (getValueAtPath(record, rowIdAccessor) as string) : rowIndex}
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

	//
}
