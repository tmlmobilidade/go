'use client';

/* * */

import { useValidationsListContext } from '@/components/validations/list/ValidationsList.context';
import { ValidationsListCellDate } from '@/components/validations/list/ValidationsListCellCreatedAt';
import { ValidationsListFiltersBar } from '@/components/validations/list/ValidationsListFiltersBar';
import { ValidationsListHeader } from '@/components/validations/list/ValidationsListHeader';
import { type ValidationNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { AgencyTag, DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane, ProcessingStatusTag, Tag, ValidityStatusTag } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';

/* * */

export function ValidationsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const validationsListContext = useValidationsListContext();

	const columns: DataTableColumn<ValidationNormalized>[] = [
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
			accessor: 'processing_status',
			render: item => <ProcessingStatusTag value={item.processing_status} />,
			title: 'Estado',
			width: 135,
		},
		{
			accessor: 'validity_status',
			render: item => <ValidityStatusTag value={item.validity_status} />,
			title: 'Resultado',
			width: 110,
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
			<ValidationsListHeader key="header" />,
			<ValidationsListFiltersBar key="filters" />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={validationsListContext.data.filtered}
				rowIdAccessor="_id"
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
