'use client';

/* * */

import { ValidationsListFilters } from '@/components/validations/list/ValidationsListFilters';
import { ValidationsListHeader } from '@/components/validations/list/ValidationsListHeader';
import { useValidationListContext } from '@/contexts/ValidationList.context';
import { Routes } from '@/lib/routes';
import { IconLock, IconLockOff } from '@tabler/icons-react';
import { type Validation } from '@tmlmobilidade/types';
import { DataTable, DataTableColumn, Pane, Tag } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import AgencyCell from '../AgencyCell';
import DateCell from '../DateCell';
import StatusCell from '../StatusCell';

/* * */

export function ValidationList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { data, flags } = useValidationListContext();

	const columns: DataTableColumn<Validation>[] = [
		{
			accessor: 'feeder_status',
			render: ({ feeder_status }) => <StatusCell status={feeder_status} />,
			title: 'Status',
			width: 200,
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
			center: true,
			render: ({ is_locked }) => {
				return is_locked ? <Tag icon={<IconLock />} variant="danger" /> : <Tag icon={<IconLockOff />} variant="success" />;
			},
			title: 'Bloqueado',
			width: 100,
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
			<ValidationsListHeader />,
			<ValidationsListFilters />,
		]}
		>
			<DataTable
				columns={columns}
				records={data.filtered}
				rowIdAccessor="_id"
				onRowClick={(validation) => {
					router.push(Routes.VALIDATION_DETAIL(validation._id));
				}}
			/>
		</Pane>
	);

	//
}
