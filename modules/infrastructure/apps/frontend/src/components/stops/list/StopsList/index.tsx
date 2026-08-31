'use client';

import { StopsListFilterBar } from '@/components/stops/list/filters/StopsListFilterBar';
import { StopsListHeader } from '@/components/stops/list/StopsListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type StopsListItem } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { DataTable, DataTableColumn, ErrorDisplay, IdTag, Pane } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';

import { useStopsListData } from '../use-stops-list-data';

/* * */

export function StopsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const { data, error, isLoading } = useStopsListData();

	const columns: DataTableColumn<StopsListItem>[] = [
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

	const handleRowClick = (item: StopsListItem) => {
		router.push(keepUrlParams(PAGE_ROUTES.infrastructure.STOPS_DETAIL(String(item._id))));
	};

	//
	// C. Render components

	return (
		<Pane header={[
			<StopsListHeader key="header" />,
			<StopsListFilterBar key="filters" />,
		]}
		>
			{error && <ErrorDisplay message={error} />}
			<DataTable
				columns={columns}
				isLoading={isLoading}
				onRowClick={handleRowClick}
				records={data}
				rowIdAccessor="_id"
				selectedId={Number(params.id)}
			/>
		</Pane>
	);
}
