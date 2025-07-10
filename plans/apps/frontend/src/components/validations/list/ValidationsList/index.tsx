'use client';

/* * */

import { ValidationsListCellAgency } from '@/components/validations/list/ValidationsListCellAgency';
import { ValidationsListCellProcessingStatus } from '@/components/validations/list/ValidationsListCellProcessingStatus';
import { ValidationsListFiltersBar } from '@/components/validations/list/ValidationsListFiltersBar';
import { ValidationsListHeader } from '@/components/validations/list/ValidationsListHeader';
import { useValidationsListContext } from '@/contexts/ValidationsList.context';
import { Routes } from '@/lib/routes';
import { type ValidationNormalized } from '@/types/normalized';
import { DataTable, type DataTableColumn, LoadingOverlay, Pane, Tag } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function ValidationsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const validationsListContext = useValidationsListContext();

	const columns: DataTableColumn<ValidationNormalized>[] = [
		{
			accessor: '_id',
			render: item => <Tag label={item._id} variant="secondary" />,
			title: '#ID',
			width: 150,
		},
		{
			accessor: 'feeder_status',
			render: item => <ValidationsListCellProcessingStatus value={item.feeder_status} />,
			title: 'Estado',
			width: 220,
		},
		{
			accessor: 'agency_id_normalized',
			render: item => <ValidationsListCellAgency agencyId={item.gtfs_agency.agency_id} agencyName={item.gtfs_agency.agency_name} />,
			title: 'Operador',
			width: 500,
		},
	];

	//
	// B. Render components

	if (validationsListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (validationsListContext.flags.error) {
		return <div>Error: {validationsListContext.flags.error.message}</div>;
	}

	return (
		<Pane header={[
			<ValidationsListHeader />,
			<ValidationsListFiltersBar />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={item => router.push(Routes.PLAN_DETAIL(item._id))}
				records={validationsListContext.data.filtered}
				rowIdAccessor="_id"
			/>
		</Pane>
	);

	//
}
