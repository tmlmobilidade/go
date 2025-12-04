'use client';

/* * */

import { PlanStatusTag } from '@/components/common/PlanStatusTag';
import { PlansListCellAgency } from '@/components/plans/list/PlansListCellAgency';
import { PlansListCellFeedDates } from '@/components/plans/list/PlansListCellFeedDates';
import { PlansListFiltersBar } from '@/components/plans/list/PlansListFiltersBar';
import { PlansListHeader } from '@/components/plans/list/PlansListHeader';
import { usePlansListContext } from '@/contexts/PlansList.context';
import { type PlanNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane, Tag } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function PlansList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const plansListContext = usePlansListContext();

	const columns: DataTableColumn<PlanNormalized>[] = [
		{
			accessor: '_id',
			render: item => <Tag label={item._id} variant="secondary" />,
			title: '#ID',
			width: 100,
		},
		{
			accessor: 'agency_id_normalized',
			render: item => <PlansListCellAgency agencyId={item.gtfs_agency.agency_id} agencyName={item.gtfs_agency.agency_name} />,
			title: 'Operador',
			width: 300,
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
			render: item => <PlanStatusTag status={item.apps?.controller?.status} timestamp={item.apps?.controller?.timestamp} />,
			title: 'SLA Status',
			width: 220,
		},
		{
			accessor: 'apps',
			render: item => <PlanStatusTag status={item.apps?.merger?.status} timestamp={item.apps?.merger?.timestamp} />,
			title: 'Merger Status',
			width: 220,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: PlanNormalized) => {
		const destUrl = keepUrlParams(PAGE_ROUTES.plans.APPROVED_DETAIL(item._id), window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	if (plansListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (plansListContext.flags.error) {
		return <ErrorDisplay message={plansListContext.flags.error.message} />;
	}

	return (
		<Pane header={[
			<PlansListHeader />,
			<PlansListFiltersBar />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={plansListContext.data.filtered}
				rowIdAccessor="_id"
			/>
		</Pane>
	);

	//
}
