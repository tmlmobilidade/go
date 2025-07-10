'use client';

/* * */

import { RolesListHeader } from '@/components/roles/list/RolesListHeader';
import { useRolesListContext } from '@/contexts/RolesList.context';
import { Routes } from '@/lib/routes';
import { type RoleNormalized } from '@/types/normalized';
import { DataTable, DataTableColumn, LoadingOverlay, Pane, Tag, TagGroup } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function RolesList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const rolesListContext = useRolesListContext();

	const columns: DataTableColumn<RoleNormalized>[] = [
		{
			accessor: '_id',
			render: item => <Tag label={item._id} variant="secondary" />,
			title: '#ID',
			width: 300,
		},
		{
			accessor: 'name',
			title: 'Nome',
			width: 200,
		},
		{
			accessor: 'permissions',
			render: item => <TagGroup tags={item.permissions.map(i => ({ label: `${i.scope}/${i.action}`, variant: 'secondary' }))} />,
			title: 'Permissões',
			width: 500,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (record: RoleNormalized) => {
		router.push(Routes.ROLE_DETAIL(record._id));
	};

	//
	// C. Render components

	if (rolesListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (rolesListContext.flags.error) {
		return <div>Error: {rolesListContext.flags.error.message}</div>;
	}

	return (
		<Pane header={[
			<RolesListHeader />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={rolesListContext.data.filtered}
				rowIdAccessor="_id"
			/>
		</Pane>
	);

	//
}
