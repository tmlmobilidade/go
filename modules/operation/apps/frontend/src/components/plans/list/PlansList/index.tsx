'use client';

import { PlansListFiltersBar } from '@/components/plans/list/filters/PlansListFiltersBar';
import { PlansListHeader } from '@/components/plans/list/PlansListHeader';
import { PlansListCellFeedDates } from '@/components/plans/list/table/PlansListCellFeedDates';
import { usePlansAgenciesData } from '@/components/plans/shared/use-plans-agencies-data';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type PlansListItem } from '@tmlmobilidade/go-operation-pckg-types';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { AgencyTag, DataTable, type DataTableColumn, ErrorDisplay, IdTag, Pane, ProcessingStatusDisplay } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';

import { usePlansListData } from '../use-plans-list-data';

/* * */

export function PlansList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const plansData = usePlansListData();

	const { data: agenciesData } = usePlansAgenciesData();

	const columns: DataTableColumn<PlansListItem>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: '#ID',
			width: 90,
		},
		{
			accessor: 'agency_id',
			render: item => (
				<AgencyTag
					agencyId={item.agency_id}
					copyOnClick={false}
					data={agenciesData}
					showShortName
				/>
			),
			title: 'Operador',
			width: 180,
		},
		{
			accessor: 'active_dates',
			render: item => (
				<PlansListCellFeedDates
					activeFrom={item.active_from}
					activeUntil={item.active_until}
					temporalStatus={item.temporal_status}
				/>
			),
			title: 'Datas de Validade',
			width: 310,
		},
		{
			accessor: 'apps',
			render: item => (
				<ProcessingStatusDisplay
					value={item.apps?.rides_feeder?.status}
					tooltip={item.apps?.rides_feeder?.timestamp && Dates
						.fromUnixMilliseconds(item.apps?.rides_feeder?.timestamp)
						.setZone('Europe/Lisbon', 'offset_only')
						.toFormat('\'Atualizado a\' yyyy-LL-dd \'às\' HH:mm')}
				/>
			),
			title: 'Monitorização',
			width: 135,
		},
		{
			accessor: 'apps',
			render: item => (
				<ProcessingStatusDisplay
					value={item.apps?.hub_publish_gtfs_cm?.status}
					tooltip={item.apps?.hub_publish_gtfs_cm?.timestamp && Dates
						.fromUnixMilliseconds(item.apps?.hub_publish_gtfs_cm?.timestamp)
						.setZone('Europe/Lisbon', 'offset_only')
						.toFormat('\'Atualizado a\' yyyy-LL-dd \'às\' HH:mm')}
				/>
			),
			title: 'GTFS CM',
			width: 135,
		},
		{
			accessor: 'apps',
			render: item => (
				<ProcessingStatusDisplay
					value={item.apps?.hub_publish_gtfs?.status}
					tooltip={item.apps?.hub_publish_gtfs?.timestamp && Dates
						.fromUnixMilliseconds(item.apps?.hub_publish_gtfs?.timestamp)
						.setZone('Europe/Lisbon', 'offset_only')
						.toFormat('\'Atualizado a\' yyyy-LL-dd \'às\' HH:mm')}
				/>
			),
			title: 'Hub GTFS',
			width: 135,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: PlansListItem) => {
		router.push(keepUrlParams(PAGE_ROUTES.operation.PLANS_DETAIL(item._id)));
	};

	//
	// C. Render components

	return (
		<Pane header={[
			<PlansListHeader key="header" />,
			<PlansListFiltersBar key="filters" />,
		]}
		>
			{plansData.error && <ErrorDisplay message={plansData.error} />}
			<DataTable
				columns={columns}
				isLoading={plansData.isLoading}
				onRowClick={handleRowClick}
				records={plansData.data}
				rowIdAccessor="_id"
				selectedId={params.id}
			/>
		</Pane>
	);
}
