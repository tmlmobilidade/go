'use client';

/* * */

import { ValidationStatusTag } from '@/components/common/ValidationStatusTag';
import { ValidationsListCellAgency } from '@/components/validations/list/ValidationsListCellAgency';
import { ValidationsListCellDate } from '@/components/validations/list/ValidationsListCellCreatedAt';
import { ValidationsListFiltersBar } from '@/components/validations/list/ValidationsListFiltersBar';
import { ValidationsListHeader } from '@/components/validations/list/ValidationsListHeader';
import { useValidationsListContext } from '@/contexts/ValidationsList.context';
import { type ValidationNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
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
			accessor: 'agency_id_normalized',
			render: item => <ValidationsListCellAgency agencyId={item.gtfs_agency.agency_id} agencyName={item.gtfs_agency.agency_name} />,
			title: 'Operador',
			width: 300,
		},
		{
			accessor: 'feeder_status',
			render: item => <ValidationStatusTag status={item.feeder_status} />,
			title: 'Estado',
			width: 150,
		},
		{
			accessor: 'created_at',
			render: item => <ValidationsListCellDate value={item.created_at} />,
			title: 'Data de Submissão',
			width: 300,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: ValidationNormalized) => {
		router.push(keepUrlParams(PAGE_ROUTES.plans.VALIDATIONS_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (validationsListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (validationsListContext.flags.error) {
		return <ErrorDisplay message={validationsListContext.flags.error.message} />;
	}

	return (
		<Pane header={[
			<ValidationsListHeader />,
			<ValidationsListFiltersBar />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={validationsListContext.data.filtered}
				rowIdAccessor="_id"
			/>
		</Pane>
	);

	//
}
