'use client';

/* * */

import { useRolesListContext } from '@/components/roles/list/RolesList.context';
import { RolesListHeader } from '@/components/roles/list/RolesListHeader';
import { type RoleNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { DataTable, DataTableColumn, ErrorDisplay, IdTag, keepUrlParams, LoadingOverlay, Pane, TagGroup } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function RolesList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const rolesListContext = useRolesListContext();
	const { t } = useTranslation();

	const columns: DataTableColumn<RoleNormalized>[] = [
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

	const handleRowClick = (item: RoleNormalized) => {
		router.push(keepUrlParams(PAGE_ROUTES.auth.ROLES_DETAIL(item._id)));
	};

	//
	// C. Render components

	if (rolesListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (rolesListContext.flags.error) {
		return <ErrorDisplay message={rolesListContext.flags.error.message} />;
	}

	return (
		<Pane header={[<RolesListHeader key="header" />]}>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={rolesListContext.data.filtered}
				rowIdAccessor="_id"
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
