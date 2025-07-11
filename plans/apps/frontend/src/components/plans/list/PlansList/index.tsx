'use client';

/* * */

import { PlansListCellAgency } from '@/components/plans/list/PlansListCellAgency';
import { PlansListCellFeedDates } from '@/components/plans/list/PlansListCellFeedDates';
import { PlansListCellIsLocked } from '@/components/plans/list/PlansListCellIsLocked';
import { PlansListFiltersBar } from '@/components/plans/list/PlansListFiltersBar';
import { PlansListHeader } from '@/components/plans/list/PlansListHeader';
import { usePlansListContext } from '@/contexts/PlansList.context';
import { Routes } from '@/lib/routes';
import { type PlanNormalized } from '@/types/normalized';
import { DataTable, type DataTableColumn, LoadingOverlay, Pane, Tag } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/utils';
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
			accessor: 'is_locked',
			render: item => <PlansListCellIsLocked value={item.is_locked} />,
			title: 'Lock Status',
			width: 120,
		},
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
			width: 350,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: PlanNormalized) => {
		const destUrl = keepUrlParams(Routes.PLAN_DETAIL(item._id), window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	if (plansListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (plansListContext.flags.error) {
		return <div>Error: {plansListContext.flags.error.message}</div>;
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
