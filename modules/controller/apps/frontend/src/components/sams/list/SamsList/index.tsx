/* eslint-disable react/jsx-key */
'use client';

import { SamsListHeader } from '@/components/sams/list/SamsListHeader';
import { useSamsListContext } from '@/contexts/SamsList.context';
import { type Sam } from '@tmlmobilidade/types';
import { DataTable, DataTableColumn, IdTag, Pane } from '@tmlmobilidade/ui';

/* * */

export function SamsList() {
	//

	//
	// A. Setup variables

	const samsListContext = useSamsListContext();

	const columns: DataTableColumn<Sam>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: '#ID',
			width: 100,
		},
	];

	//
	// B. Render components

	return (
		<Pane header={[
			<SamsListHeader />,
		]}
		>
			<DataTable
				columns={columns}
				records={samsListContext.data.raw}
			/>
		</Pane>
	);
}
