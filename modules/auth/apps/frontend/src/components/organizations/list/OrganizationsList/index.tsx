'use client';

/* * */

import { useOrganizationsListContext } from '@/components/organizations/list/OrganizationsList.context';
import { OrganizationsListHeader } from '@/components/organizations/list/OrganizationsListHeader';
import { type OrganizationNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, keepUrlParams, LoadingOverlay, Pane } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function OrganizationsList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const organizationsListContext = useOrganizationsListContext();

	const { t } = useTranslation();

	const columns: DataTableColumn<OrganizationNormalized>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: t('default:organizations.list.table.columns.id.label'),
			width: 100,
		},
		{
			accessor: 'long_name',
			title: t('default:organizations.list.table.columns.name.label'),
			width: 600,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: OrganizationNormalized) => {
		router.push(keepUrlParams(PAGE_ROUTES.auth.ORGANIZATIONS_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (organizationsListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (organizationsListContext.flags.error) {
		return <ErrorDisplay message={organizationsListContext.flags.error.message} />;
	}

	return (
		<Pane header={[<OrganizationsListHeader key="header" />]}>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={organizationsListContext.data.filtered}
				rowIdAccessor="_id"
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
