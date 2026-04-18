'use client';

/* * */

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { StopsListFilterBar } from '@/components/stops/list/StopsListFilterBar';
import { StopsListHeader } from '@/components/stops/list/StopsListHeader';
import { type StopNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { DataTable, DataTableColumn, ErrorDisplay, IdTag, LoadingOverlay, Pane } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';

/* * */

export function StopsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const stopsListContext = useStopsListContext();

	const columns: DataTableColumn<StopNormalized>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: '#ID',
			width: 100,
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
			width: 250,
		},
		{
			accessor: 'municipality_name',
			title: 'Município',
			width: 250,
		},
		{
			accessor: 'parish_name',
			title: 'Freguesia',
			width: 250,
		},
		{
			accessor: 'locality_name',
			title: 'Localidade',
			width: 250,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: StopNormalized) => {
		router.push(keepUrlParams(PAGE_ROUTES.stops.STOPS_DETAIL(String(item._id))));
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
			<StopsListHeader key="header" />,
			<StopsListFilterBar key="filters" />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={stopsListContext.data.filtered}
				rowIdAccessor="_id"
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
