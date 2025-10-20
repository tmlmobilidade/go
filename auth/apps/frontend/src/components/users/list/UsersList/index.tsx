'use client';

/* * */

import { UsersListFieldRole } from '@/components/users/list/UsersListFieldRole';
import { UsersListFilterBar } from '@/components/users/list/UsersListFilterBar';
import { UsersListHeader } from '@/components/users/list/UsersListHeader';
import { useUsersListContext } from '@/contexts/UsersList.context';
import { Routes } from '@/lib/routes';
import { type UserNormalized } from '@/types/normalized';
import { DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane, Tag } from '@tmlmobilidade/ui';
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
			width: 120,
		},
		{
			accessor: 'full_name',
			title: 'Nome',
			width: 400,
		},
		{
			accessor: 'role_ids',
			render: item => item.role_ids.map(role => <UsersListFieldRole key={role} role_id={role} />),
			title: 'Grupos',
			width: 200,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: UserNormalized) => {
		const destUrl = keepUrlParams(Routes.USER_DETAIL(item._id), window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	if (usersListContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (usersListContext.flags.error) {
		return <ErrorDisplay message={usersListContext.flags.error.message} />;
	}

	return (
		<Pane header={[
			<UsersListHeader />,
			<UsersListFilterBar />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={usersListContext.data.filtered}
				rowIdAccessor="_id"
				selectedId={usersListContext.data.selectedId}
			/>
		</Pane>
	);

	//
}
