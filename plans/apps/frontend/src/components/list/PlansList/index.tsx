'use client';

/* * */

import { PlansListFilters } from '@/components/list/PlansListFilters';
import { PlansListHeader } from '@/components/list/PlansListHeader';
import { usePlanListContext } from '@/contexts/PlanList.context';
import { Routes } from '@/lib/routes';
import { type Plan } from '@tmlmobilidade/types';
import { DataTable, DataTableColumn, Pane } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import DateCell from '../DateCell';

/* * */

export function PlanList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { data, flags } = usePlanListContext();

	const columns: DataTableColumn<Plan>[] = [
		{
			accessor: 'valid_from',
			render: ({ valid_from }) => <DateCell date={valid_from} endDate={valid_from} />,
			title: 'Data de início',
			width: 150,
		},
		{
			accessor: 'valid_until',
			render: ({ valid_until }) => <DateCell date={valid_until} endDate={valid_until} />,
			title: 'Data de fim',
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
