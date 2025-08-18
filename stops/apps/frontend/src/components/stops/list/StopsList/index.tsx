'use client';

/* * */

import { StopsListFilterBar } from '@/components/stops/list/StopsListFilterBar';
import { StopsListHeader } from '@/components/stops/list/StopsListHeader';
import { useStopsListContext } from '@/contexts/StopsList.context';
import { type Stop } from '@tmlmobilidade/types';
import { DataTable, DataTableColumn, ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';

/* * */

export function StopsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const stopsListContext = useStopsListContext();

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
			width: 200,
		},
		{
			accessor: 'longitude',
			render: item => item.longitude,
			title: 'longitude',
			width: 200,
		},

	];

	//
	// B. Handle actions

	const handleRowClick = (item: Stop) => {
		const destUrl = keepUrlParams(`/stops/${item._id}`, window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	if (stopsListContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (stopsListContext.flags.error) {
		return <ErrorDisplay message={stopsListContext.flags.error.message} />;
	}

	return (
		<Pane header={[
			<StopsListHeader />,
			<StopsListFilterBar />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={stopsListContext.data.filtered}
				rowIdAccessor="_id"
			/>
		</Pane>
	);

	//
}
