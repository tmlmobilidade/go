'use client';

/* * */

import { PlansListFilters } from '@/components/plans/list/PlansListFilters';
import { PlansListHeader } from '@/components/plans/list/PlansListHeader';
import { usePlanListContext } from '@/contexts/PlanList.context';
import { Routes } from '@/lib/routes';
import { type Plan } from '@tmlmobilidade/types';
import { DataTable, DataTableColumn, Pane, Tag } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
/* * */

export function PlanList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { data, flags } = usePlanListContext();

	const columns: DataTableColumn<Plan>[] = [
		{
			accessor: '_id',
			render: ({ _id }) => <Tag label={_id} variant="muted" />,
			width: 150,
		},
	];

	//
	// B. Render components

	if (flags.isLoading) {
		return <div>Loading...</div>;
	}
	else if (flags.error) {
		return <div>Error: {flags.error.message}</div>;
	}

	return (
		<Pane header={[
			<PlansListHeader />,
			<PlansListFilters />,
		]}
		>
			<DataTable
				columns={columns}
				records={data.filtered}
				rowIdAccessor="_id"
				onRowClick={(plan) => {
					router.push(Routes.PLAN_DETAIL(plan._id));
				}}
			/>
		</Pane>
	);

	//
}
