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
