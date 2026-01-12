'use client';

/* * */

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { StopsListFilterBar } from '@/components/stops/list/StopsListFilterBar';
import { StopsListHeader } from '@/components/stops/list/StopsListHeader';
import { type StopNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { DataTable, DataTableColumn, ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function StopsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const stopsListContext = useStopsListContext();
	const { t } = useTranslation();

	const columns: DataTableColumn<StopNormalized>[] = [
		{
			accessor: '_id',
			title: t('stops:stops.list.StopsList.table.columns.code.label'),
			width: 150,
		},
		{
			accessor: 'name',
			title: t('stops:stops.list.StopsList.table.columns.name.label'),
			width: 500,
		},
		{
			accessor: 'latitude',
			title: t('stops:stops.list.StopsList.table.columns.latitude.label'),
			width: 150,
		},
		{
			accessor: 'longitude',
			title: t('stops:stops.list.StopsList.table.columns.longitude.label'),
			width: 150,
		},
		{
			accessor: 'district_name',
			title: t('stops:stops.list.StopsList.table.columns.district.label'),
			width: 250,
		},
		{
			accessor: 'municipality_name',
			title: t('stops:stops.list.StopsList.table.columns.municipality.label'),
			width: 250,
		},
		{
			accessor: 'parish_name',
			title: t('stops:stops.list.StopsList.table.columns.parish.label'),
			width: 250,
		},
		{
			accessor: 'locality_name',
			title: t('stops:stops.list.StopsList.table.columns.locality.label'),
			width: 250,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: StopNormalized) => {
		router.push(keepUrlParams(PAGE_ROUTES.stops.STOPS_DETAIL(item._id)));
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
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
