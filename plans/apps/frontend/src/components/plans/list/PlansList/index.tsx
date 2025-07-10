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
			width: 150,
		},
		{
			accessor: '_id',
			render: item => <Tag label={item._id} variant="secondary" />,
			title: '#ID',
			width: 150,
		},
		{
			accessor: 'agency_id_normalized',
			render: item => <PlansListCellAgency agencyId={item.gtfs_agency.agency_id} agencyName={item.gtfs_agency.agency_name} />,
			title: 'Operador',
			width: 500,
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
			width: 500,
		},
	];

	//
	// B. Render components

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
				onRowClick={item => router.push(Routes.PLAN_DETAIL(item._id))}
				records={plansListContext.data.filtered}
				rowIdAccessor="_id"
			/>
		</Pane>
	);

	//
}

// 'use client';

// /* * */

// import { PlansListFilters } from '@/components/plans/list/PlansListFilters';
// import { PlansListHeader } from '@/components/plans/list/PlansListHeader';
// import { usePlanListContext } from '@/contexts/PlanList.context';
// import { Routes } from '@/lib/routes';
// import { IconArrowRight, IconLock, IconLockOpen } from '@tabler/icons-react';
// import { Pane, Section, Tag, Text } from '@tmlmobilidade/ui';
// import { Dates } from '@tmlmobilidade/utils';
// import { useRouter } from 'next/navigation';

// import styles from './styles.module.css';

// /* * */

// export function PlanList() {
// 	//

// 	//
// 	// A. Setup variables

// 	const router = useRouter();
// 	const { data, flags } = usePlanListContext();

// 	//
// 	// B. Render components

// 	if (flags.isLoading) {
// 		return <div>Loading...</div>;
// 	}

// 	if (flags.error) {
// 		return <div>Error: {flags.error.message}</div>;
// 	}

// 	return (
// 		<Pane header={[
// 			<PlansListHeader />,
// 			<PlansListFilters />,
// 		]}
// 		>
// 			{data.filtered.map((plan) => {
// 				if (!plan || !plan.gtfs_agency || !plan.gtfs_feed_info) {
// 					return (
// 						<div key={plan._id} className={styles.root} onClick={() => router.push(Routes.PLAN_DETAIL(plan._id))}>
// 							<Section alignItems="center" flexDirection="row" flexWrap="wrap" gap="sm">
// 								<Tag label={plan._id} variant="muted" />
// 								<Text>Invalid plan</Text>
// 							</Section>
// 						</div>
// 					);
// 				}

// 				return (
// 					<div key={plan._id} className={styles.root} onClick={() => router.push(Routes.PLAN_DETAIL(plan._id))}>
// 						<Section alignItems="center" flexDirection="row" flexWrap="wrap" gap="sm">
// 							<Tag label={plan._id} variant="muted" />
// 							<Tag label={plan.gtfs_agency.agency_name} variant="secondary" />
// 						</Section>
// 						<Section alignItems="center" flexDirection="row" gap="md">
// 							<Section alignItems="center" flexDirection="row" gap="sm">
// 								<Tag label={Dates.fromOperationalDate(plan.gtfs_feed_info.feed_start_date, 'Europe/Lisbon').toLocaleString(Dates.FORMATS.DATE_SHORT)} variant="success" />
// 								<IconArrowRight size={16} />
// 								<Tag
// 									label={Dates.fromOperationalDate(plan.gtfs_feed_info.feed_end_date, 'Europe/Lisbon').toLocaleString(Dates.FORMATS.DATE_SHORT)}
// 									variant={
// 										Dates.now('local').operational_date > Dates.fromOperationalDate(plan.gtfs_feed_info.feed_end_date, 'Europe/Lisbon').operational_date ? 'danger' : 'warning'
// 									}
// 								/>
// 							</Section>

// 							{plan.is_locked ? <IconLock color="var(--color-status-danger-primary)" /> : <IconLockOpen color="var(--color-status-success-primary)" />}
// 						</Section>
// 					</div>
// 				);
// 			})}
// 		</Pane>
// 	);

// 	//
// }
