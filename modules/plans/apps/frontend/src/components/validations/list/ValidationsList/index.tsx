'use client';

/* * */

import { ValidationStatusTag } from '@/components/common/ValidationStatusTag';
import { useValidationsListContext } from '@/components/validations/list/ValidationsList.context';
import { ValidationsListCellAgency } from '@/components/validations/list/ValidationsListCellAgency';
import { ValidationsListCellDate } from '@/components/validations/list/ValidationsListCellCreatedAt';
import { ValidationsListFiltersBar } from '@/components/validations/list/ValidationsListFiltersBar';
import { ValidationsListHeader } from '@/components/validations/list/ValidationsListHeader';
import { type ValidationNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane, Tag } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function ValidationsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const validationsListContext = useValidationsListContext();
	const { t } = useTranslation('plans', { keyPrefix: 'validations.list' });

	const columns: DataTableColumn<ValidationNormalized>[] = [
		{
			accessor: '_id',
			render: item => <Tag label={item._id} variant="secondary" />,
			title: '#ID',
			width: 100,
		},
		{
			accessor: 'feeder_status',
			render: item => <ValidationStatusTag status={item.feeder_status} />,
			title: t('tableColumns.feederStatus'),
			width: 125,
		},
		{
			accessor: 'agency_id_normalized',
			render: item => <ValidationsListCellAgency agencyId={item.gtfs_agency.agency_id} agencyName={item.gtfs_agency.agency_name} />,
			title: t('tableColumns.agencyName'),
			width: 400,
		},
		{
			accessor: 'created_at',
			render: item => <ValidationsListCellDate value={item.created_at} />,
			title: t('tableColumns.createdAt'),
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
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
