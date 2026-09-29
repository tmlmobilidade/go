'use client';

import { StopsListFiltersBar } from '@/components/stops/list/filters/StopsListFiltersBar';
import { StopsListHeader } from '@/components/stops/list/StopsListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type StopsListItem } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, keepUrlParams, Pane } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useStopsDetailStopId } from '../../detail/use-stops-detail-stop-id';
import { useStopsListData } from '../use-stops-list-data';

/* * */

export function StopsList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const router = useRouter();

	const { stopId } = useStopsDetailStopId();

	const stopsData = useStopsListData();

	const columns: DataTableColumn<StopsListItem>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: t('default:stops.list.Table.columns.id'),
			width: 100,
		},
		{
			accessor: 'name',
			title: t('default:stops.list.Table.columns.name'),
			width: 500,
		},
		{
			accessor: 'latitude',
			title: t('default:stops.list.Table.columns.latitude'),
			width: 150,
		},
		{
			accessor: 'longitude',
			title: t('default:stops.list.Table.columns.longitude'),
			width: 150,
		},
		{
			accessor: 'location.primary.name',
			title: t('default:stops.list.Table.columns.location_primary_name'),
			width: 250,
		},
		{
			accessor: 'location.secondary.name',
			title: t('default:stops.list.Table.columns.location_secondary_name'),
			width: 400,
		},
		{
			accessor: 'location.tertiary.name',
			title: t('default:stops.list.Table.columns.location_tertiary_name'),
			width: 250,
		},
		{
			accessor: 'location.neighbourhood.name',
			title: t('default:stops.list.Table.columns.location_neighbourhood_name'),
			width: 250,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: StopsListItem) => {
		router.push(keepUrlParams(PAGE_ROUTES.infrastructure.STOPS_DETAIL(item._id)));
	};

	//
	// C. Render components

	return (
		<Pane header={[<StopsListHeader key="header" />, <StopsListFiltersBar key="filters" />]}>
			{stopsData.error && <ErrorDisplay message={stopsData.error} />}
			<DataTable
				columns={columns}
				isLoading={stopsData.isLoading}
				onRowClick={handleRowClick}
				records={stopsData.data}
				rowIdAccessor="_id"
				selectedId={stopId}
			/>
		</Pane>
	);
}
