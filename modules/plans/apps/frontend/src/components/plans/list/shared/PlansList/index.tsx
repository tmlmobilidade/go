'use client';

import { PlansListCellFeedDates } from '@/components/plans/list/filters/PlansListCellFeedDates';
import { PlansListFiltersBar } from '@/components/plans/list/filters/PlansListFiltersBar';
import { PlansListHeader } from '@/components/plans/list/shared/PlansListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type PlanListItem } from '@tmlmobilidade/go-plans-pckg-types';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { AgencyTag, DataTable, type DataTableColumn, ErrorDisplay, IdTag, Pane, ProcessingStatusDisplay } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';

import { usePlansListData } from '../../use-plans-list-data';

/* * */

export function PlansList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const plansData = usePlansListData();

	const columns: DataTableColumn<PlanListItem>[] = [
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
					request={{
						permissions: {
							actions: [PermissionCatalog.all.plans.actions.read],
							scope: PermissionCatalog.all.plans.scope,
						},
					}}
					showShortName
				/>
			),
			title: 'Operador',
			width: 180,
		},
		{
			accessor: 'gtfs_feed_info',
			render: item => (
				<PlansListCellFeedDates
					endDate={item.gtfs_feed_info.feed_end_date}
					startDate={item.gtfs_feed_info.feed_start_date}
					validityStatus={item.validity_status}
				/>
			),
			title: 'Datas de Validade',
			width: 310,
		},
		{
			accessor: 'apps',
			render: item => (
				<ProcessingStatusDisplay
					value={item.apps?.controller?.status}
					tooltip={item.apps?.controller?.timestamp && Dates
						.fromUnixTimestamp(item.apps?.controller?.timestamp)
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
					value={item.apps?.merger?.status}
					tooltip={item.apps?.merger?.timestamp && Dates
						.fromUnixTimestamp(item.apps?.merger?.timestamp)
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
					value={item.apps?.hub_gtfs?.status}
					tooltip={item.apps?.hub_gtfs?.timestamp && Dates
						.fromUnixTimestamp(item.apps?.hub_gtfs?.timestamp)
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

	const handleRowClick = (item: PlanListItem) => {
		router.push(keepUrlParams(PAGE_ROUTES.plans.APPROVED_DETAIL(item._id)));
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

	//
}
