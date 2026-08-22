'use client';

import { RolesListHeader } from '@/components/roles/list/RolesListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { RolesListItem } from '@tmlmobilidade/go-core-pckg-types';
import { DataTable, DataTableColumn, ErrorDisplay, IdTag, keepUrlParams, Pane, TagGroup } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useRolesDetailRoleId } from '../../detail/use-roles-detail-role-id';
import { useRolesListData } from '../use-roles-list-data';

/* * */

export function RolesList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const router = useRouter();

	const { roleId } = useRolesDetailRoleId();

	const rolesData = useRolesListData();

	const columns: DataTableColumn<RolesListItem>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: t('default:roles.list.Header.Table.columns.id'),
			width: 120,
		},
		{
			accessor: 'name',
			title: t('default:roles.list.Header.Table.columns.name'),
			width: 200,
		},
		{
			accessor: 'permissions',
			render: item => <TagGroup tags={item.permissions.map(i => ({ label: `${i.scope}/${i.action}`, variant: 'secondary' }))} />,
			title: t('default:roles.list.Header.Table.columns.permissions'),
			width: 500,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: RolesListItem) => {
		router.push(keepUrlParams(PAGE_ROUTES.core.ROLES_DETAIL(item._id)));
	};

	//
	// C. Render components

	return (
		<Pane
			header={[
				<RolesListHeader key="header" />,
			]}
		>
			{rolesData.error && <ErrorDisplay message={rolesData.error} />}
			<DataTable
				columns={columns}
				isLoading={rolesData.isLoading}
				onRowClick={handleRowClick}
				records={rolesData.data}
				rowIdAccessor="_id"
				selectedId={roleId}
			/>
		</Pane>
	);
}
