'use client';

import { ValidationsListFiltersBar } from '@/components/validations/list/filters/ValidationsListFiltersBar';
import { ValidationsListCellDate } from '@/components/validations/list/shared/ValidationsListCellCreatedAt';
import { ValidationsListHeader } from '@/components/validations/list/shared/ValidationsListHeader';
import { useValidationsAgencies } from '@/components/validations/shared/use-validations-agencies';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type ValidationListItem } from '@tmlmobilidade/go-plans-pckg-types';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { AgencyTag, DataTable, type DataTableColumn, ErrorDisplay, IdTag, Pane, ProcessingStatusDisplay, ValidityStatusDisplay } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';

import { useValidationsListData } from '../../use-validations-list-data';

/* * */

export function ValidationsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const validationsData = useValidationsListData();
	const { data: agenciesData } = useValidationsAgencies({
		permissions: {
			actions: [PermissionCatalog.all.gtfs_validations.actions.read],
			scope: PermissionCatalog.all.gtfs_validations.scope,
		},
	});

	const columns: DataTableColumn<ValidationListItem>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: '#ID',
			width: 90,
		},
		{
			accessor: 'agency_id_normalized',
			render: item => (
				<AgencyTag
					agencyId={item.agency_id}
					copyOnClick={false}
					data={agenciesData}
					showShortName
				/>
			),
			title: 'Operador',
			width: 180,
		},
		{
			accessor: 'processing_status',
			render: item => <ProcessingStatusDisplay value={item.processing_status} />,
			title: 'Estado',
			width: 135,
		},
		{
			accessor: 'validity_status',
			render: item => <ValidityStatusDisplay value={item.validity_status} />,
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

	const handleRowClick = (item: ValidationListItem) => {
		router.push(keepUrlParams(PAGE_ROUTES.plans.VALIDATIONS_DETAIL(item._id)));
	};

	//
	// C. Render components

	return (
		<Pane header={[
			<ValidationsListHeader key="header" />,
			<ValidationsListFiltersBar key="filters" />,
		]}
		>
			{validationsData.error && <ErrorDisplay message={validationsData.error} />}
			<DataTable
				columns={columns}
				isLoading={validationsData.isLoading}
				onRowClick={handleRowClick}
				records={validationsData.data}
				rowIdAccessor="_id"
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
