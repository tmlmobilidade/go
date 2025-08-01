'use client';

/* * */

import { useStopListContext } from '@/contexts/StopList.context';
import { Routes } from '@/lib/routes';
import { Stop } from '@tmlmobilidade/types';
import { DataTable, DataTableColumn, Pane } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';

/* * */

export function StopsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data, flags } = useStopListContext();

	const columns: DataTableColumn<Stop>[] = [
		{
			accessor: '_id',
			render: item => item._id,
			title: 'codigo',
			width: 150,
		},
		{
			accessor: 'name',
			render: item => item.name,
			title: 'nome da paragem',
			width: 500,
		},
		{
			accessor: 'latitude',
			render: item => item.latitude,
			title: 'latitude',
			width: 150,
		},
		{
			accessor: 'longitude',
			render: item => item.longitude,
			title: 'longitude',
			width: 150,
		},

	];

	//
	// B. Handle Actions

	const handleRowClick = (item: Stop) => {
		const destUrl = keepUrlParams(Routes.STOPS_DETAIL(item._id), window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	if (flags.error) {
		return <div>Error: {flags.error.message}</div>;
	}

	return (
		<Pane>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={data.filtered}
				rowIdAccessor="_id"
			/>
		</Pane>
	);

	//
}
