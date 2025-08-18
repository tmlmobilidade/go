'use client';

/* * */

import { StopsListFilterBar } from '@/components/stops/list/StopsListFilterBar';
import { StopsListHeader } from '@/components/stops/list/StopsListHeader';
import { useStopsListContext } from '@/contexts/StopsList.context';
import { type StopNormalized } from '@/types/normalized';
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

	const columns: DataTableColumn<StopNormalized>[] = [
		{
			accessor: '_id',
			title: 'codigo',
			width: 150,
		},
		{
			accessor: 'name',
			title: 'nome da paragem',
			width: 500,
		},
		{
			accessor: 'latitude',
			title: 'latitude',
			width: 150,
		},
		{
			accessor: 'longitude',
			title: 'longitude',
			width: 150,
		},
		{
			accessor: 'district_name',
			title: 'Distrito',
			width: 150,
		},
		{
			accessor: 'municipality_name',
			title: 'Município',
			width: 150,
		},
		{
			accessor: 'parish_name',
			title: 'Freguesia',
			width: 150,
		},
		{
			accessor: 'locality_name',
			title: 'Localidade',
			width: 150,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: StopNormalized) => {
		const destUrl = keepUrlParams(`/stops/${item._id}`, window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	if (stopsListContext.flags.loading) {
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
