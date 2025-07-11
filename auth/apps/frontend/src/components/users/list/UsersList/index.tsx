'use client';

/* * */

import { UsersListHeader } from '@/components/users/list/UsersListHeader';
import { useUsersListContext } from '@/contexts/UsersList.context';
import { Routes } from '@/lib/routes';
import { type UserNormalized } from '@/types/normalized';
import { DataTable, type DataTableColumn, LoadingOverlay, Pane, Tag } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';

/* * */

export function UsersList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const usersListContext = useUsersListContext();

	const columns: DataTableColumn<UserNormalized>[] = [
		{
			accessor: '_id',
			render: item => <Tag label={item._id} variant="secondary" />,
			title: '#ID',
			width: 300,
		},
		{
			accessor: 'first_name',
			title: 'Nome',
			width: 200,
		},
		{
			accessor: 'last_name',
			title: 'Apelido',
			width: 200,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: UserNormalized) => {
		const destUrl = keepUrlParams(Routes.ROLE_DETAIL(item._id), window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	if (usersListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (usersListContext.flags.error) {
		return <div>Error: {usersListContext.flags.error.message}</div>;
	}

	return (
		<Pane header={[
			<UsersListHeader />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={usersListContext.data.filtered}
				rowIdAccessor="_id"
			/>
		</Pane>
	);

	//
}
