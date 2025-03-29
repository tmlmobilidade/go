'use client';

/* * */

import { UsersListHeader } from '@/components/UsersListHeader';
import { useUsersListContext } from '@/contexts/UsersList.context';
import { Routes } from '@/lib/routes';
import { User } from '@tmlmobilidade/types';
import { DataTable, type DataTableColumn } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function UsersList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const usersListContext = useUsersListContext();

	const columns: DataTableColumn<User>[] = [
		{ accessor: '_id', title: 'ID' },
		{ accessor: 'first_name', title: 'Primeiro Nome' },
		{ accessor: 'last_name', title: 'Último Nome' },
		{ accessor: 'email', title: 'Email' },
	];

	//
	// B. Handle actions

	const handleRowClick = (record: User) => {
		router.push(Routes.USER_DETAIL(record._id));
	};

	//
	// C. Render components

	if (usersListContext.flags.error) {
		return <div>Error: {usersListContext.flags.error.message}</div>;
	}

	if (usersListContext.flags.loading) {
		return <div>Loading...</div>;
	}

	return (
		<>
			<UsersListHeader />
			<DataTable columns={columns} onRowClick={handleRowClick} records={usersListContext.data.filtered} />
		</>
	);

	//
}
