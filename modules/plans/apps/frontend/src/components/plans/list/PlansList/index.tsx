'use client';

/* * */

import { usePlansListContext } from '@/components/plans/list/PlansList.context';
import { PlansListCellFeedDates } from '@/components/plans/list/PlansListCellFeedDates';
import { PlansListFiltersBar } from '@/components/plans/list/PlansListFiltersBar';
import { PlansListHeader } from '@/components/plans/list/PlansListHeader';
import { type PlanNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { AgencyTag, DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane, ProcessingStatusTag, Tag } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';

/* * */

export function PlansList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const plansListContext = usePlansListContext();

	const columns: DataTableColumn<PlanNormalized>[] = [
		{
			accessor: '_id',
			render: item => <Tag label={item._id} variant="secondary" />,
			title: '#ID',
			width: 90,
		},
		{
			accessor: 'agency_id_normalized',
			render: item => <AgencyTag agencyId={item.gtfs_agency.agency_id} showShortName />,
			title: 'Operador',
			width: 110,
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
				<ProcessingStatusTag
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
				<ProcessingStatusTag
					value={item.apps?.merger?.status}
					tooltip={item.apps?.merger?.timestamp && Dates
						.fromUnixTimestamp(item.apps?.merger?.timestamp)
						.setZone('Europe/Lisbon', 'offset_only')
						.toFormat('\'Atualizado a\' yyyy-LL-dd \'às\' HH:mm')}
				/>
			),
			title: 'Inf. Público',
			width: 135,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: PlanNormalized) => {
		router.push(keepUrlParams(PAGE_ROUTES.plans.APPROVED_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (plansListContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (plansListContext.flags.error) {
		return <ErrorDisplay message={plansListContext.flags.error.message} />;
	}

	return (
		<Pane header={[
			<PlansListHeader key="header" />,
			<PlansListFiltersBar key="filters" />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={plansListContext.data.filtered}
				rowIdAccessor="_id"
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
