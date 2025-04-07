'use client';

/* * */

import { RoleListHeader } from '@/components/roles/RoleListHeader';
import { useRoleListContext } from '@/contexts/RoleList.context';
import { Routes } from '@/lib/routes';
import { Role } from '@tmlmobilidade/types';
import { Badge, DataTable, DataTableColumn, Pane } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function RoleList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const roleListContext = useRoleListContext();

	const columns: DataTableColumn<Role>[] = [
		{ accessor: '_id', title: 'ID' },
		{ accessor: 'name', title: 'Nome' },
		{ accessor: 'permissions', render: ({ permissions }) => <Badge variant="muted">{permissions.length} Permissões</Badge>, title: '# Permissões' },
	];

	//
	// B. Handle actions

	const handleRowClick = (record: Role) => {
		router.push(Routes.USER_DETAIL(record._id));
	};

	//
	// C. Render components

	if (roleListContext.flags.error) {
		return <div>Error: {roleListContext.flags.error.message}</div>;
	}

	if (roleListContext.flags.loading) {
		return <div>Loading...</div>;
	}

	return (
		<Pane header={[<RoleListHeader />]}>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={roleListContext.data.filtered}
			/>
		</Pane>
	);

	//
}
