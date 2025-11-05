'use client';

/* * */

import { type DataTableProps } from '@/components/datatable/DataTable';
import { useDataTableContext } from '@/components/datatable/DataTableContext';
import { DataTableHeader } from '@/components/datatable/DataTableHeader';
import { DataTableRow } from '@/components/datatable/DataTableRow';
import { getValueAtPath } from '@go/utils';
import { ViewportList } from 'react-viewport-list';

/* * */

type Props<T> = Omit<DataTableProps<T>, 'records'>;

/* * */

export function DataTableContent<T>({ columns, onRowClick, onRowContextMenu, onRowDoubleClick, rowIdAccessor, selectedId }: Props<T>) {
	//

	//
	// A. Setup Variables

	const dataTableContext = useDataTableContext<T>();

	//
	// B. Render Components

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
						isSelected={rowIdAccessor ? (getValueAtPath(record, rowIdAccessor) as string) === selectedId : false}
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
