'use client';

/* * */

import { PlansListFilters } from '@/components/plans/list/PlansListFilters';
import { PlansListHeader } from '@/components/plans/list/PlansListHeader';
import { usePlanListContext } from '@/contexts/PlanList.context';
import { Routes } from '@/lib/routes';
import { IconCheck, IconLock, IconLockOff, IconX } from '@tabler/icons-react';
import { type Plan } from '@tmlmobilidade/types';
import { DataTable, DataTableColumn, Pane, Tag } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import AgencyCell from '../AgencyCell';
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
			accessor: '_id',
			render: ({ _id }) => <Tag label={_id} variant="muted" />,
			title: 'ID',
			width: 150,
		},
		{
			accessor: 'agency_id',
			render: ({ agency_id }) => {
				return <AgencyCell agencyId={agency_id} />;
			},
			title: 'Operador',
			width: 300,
		},
		{
			accessor: 'is_locked',
			render: ({ is_locked }) => {
				return is_locked ? <Tag icon={<IconLock />} variant="danger" /> : <Tag icon={<IconLockOff />} variant="success" />;
			},
			title: 'Bloqueado',
			width: 100,
		},
		{
			accessor: 'is_approved',
			center: true,
			render: ({ is_approved }) => {
				return is_approved ? <Tag icon={<IconCheck />} variant="success" /> : <Tag icon={<IconX />} variant="danger" />;
			},
			title: 'Aprovado',
			width: 200,
		},
		{
			accessor: 'valid_from',
			render: ({ valid_from }) => <DateCell date={valid_from} endDate={valid_from} />,
			title: 'Data de início',
			width: 300,
		},
		{
			accessor: 'valid_until',
			render: ({ valid_until }) => <DateCell date={valid_until} endDate={valid_until} />,
			title: 'Data de fim',
			width: 300,
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
