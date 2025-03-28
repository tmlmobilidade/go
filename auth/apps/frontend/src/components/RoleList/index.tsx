'use client';

import { useRoleListContext } from '@/contexts/RoleList.context';
import { Routes } from '@/lib/routes';
import { Role } from '@tmlmobilidade/types';
import { Badge, DataTable, DataTableColumn } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import Header from './ListHeader';

export default function RoleList() {
	//

	//
	// A. Setup variables
	const router = useRouter();
	const { data, flags } = useRoleListContext();

	//
	// B. Handle actions
	const handleRowClick = (record: Role) => {
		router.push(Routes.USER_DETAIL(record._id));
	};

	//
	// C. Render Components
	if (flags.error) {
		return <div>Error: {flags.error.message}</div>;
	}

	if (flags.loading) {
		return <div>Loading...</div>;
	}

	const columns: DataTableColumn<Role>[] = [
		{
			accessor: '_id',
			title: 'ID',
		},
		{
			accessor: 'name',
			title: 'Nome',
		},
		{
			accessor: 'permissions',
			render: ({ permissions }) => {
				const count = permissions.length;
				return <Badge variant="muted">{count} Permissões</Badge>;
			},
			title: '# Permissões',
		},
	];
	return (
		<>
			<Header />
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={data.filtered}
			/>
		</>
	);
}
