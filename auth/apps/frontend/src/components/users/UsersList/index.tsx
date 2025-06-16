'use client';

/* * */

import { UsersListHeader } from '@/components/users/UsersListHeader';
import { useUsersListContext } from '@/contexts/UsersList.context';
import { Routes } from '@/lib/routes';
import { User } from '@tmlmobilidade/types';
import { DataTable, type DataTableColumn, Loader, Pane } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import styles from './styles.module.css';

/* * */

export function UsersList() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const usersListContext = useUsersListContext();

	const columns: DataTableColumn<User>[] = [
		{ accessor: '_id', title: 'ID', width: 250 },
		{ accessor: 'first_name', title: 'Primeiro Nome', width: 250 },
		{ accessor: 'last_name', title: 'Último Nome', width: 250 },
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
		return <Loader />;
	}

	return (
		<Pane header={[<UsersListHeader />]}>
			<DataTable
				classnames={{ root: styles.table, row: styles.row }}
				columns={columns}
				onRowClick={handleRowClick}
				records={usersListContext.data.filtered}
			/>
		</Pane>
	);

	//
}
