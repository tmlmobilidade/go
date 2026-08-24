'use client';

import { OrganizationsListHeader } from '@/components/organizations/list/OrganizationsListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { OrganizationsListItem } from '@tmlmobilidade/go-core-pckg-types';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, keepUrlParams, Pane } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useOrganizationsDetailOrganizationId } from '../../detail/use-organizations-detail-organization-id';
import { useOrganizationsListData } from '../use-organizations-list-data';

/* * */

export function OrganizationsList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const router = useRouter();

	const { organizationId } = useOrganizationsDetailOrganizationId();

	const organizationsData = useOrganizationsListData();

	const columns: DataTableColumn<OrganizationsListItem>[] = [
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

	const handleRowClick = (item: OrganizationsListItem) => {
		router.push(keepUrlParams(PAGE_ROUTES.core.ORGANIZATIONS_DETAIL(item._id)));
	};

	//
	// C. Render components

	return (
		<Pane
			header={[
				<OrganizationsListHeader key="header" />,
			]}
		>
			{organizationsData.error && <ErrorDisplay message={organizationsData.error} />}
			<DataTable
				columns={columns}
				isLoading={organizationsData.isLoading}
				onRowClick={handleRowClick}
				records={organizationsData.data}
				rowIdAccessor="_id"
				selectedId={organizationId}
			/>
		</Pane>
	);
}
