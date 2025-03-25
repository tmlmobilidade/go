'use client';

import { useUserListContext } from '@/contexts/UserList.context';
import { Routes } from '@/lib/routes';
import { User } from '@tmlmobilidade/types';
import { DataTable, DataTableColumn } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import Header from './ListHeader';

export default function UserList() {
	//

	//
	// A. Setup variables
	const router = useRouter();
	const { data, flags } = useUserListContext();

	//
	// B. Handle actions
	const handleRowClick = (record: User) => {
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

	const columns: DataTableColumn<User>[] = [
		{
			accessor: '_id',
			title: 'ID',
		},
		{
			accessor: 'first_name',
			title: 'Primeiro Nome',
		},
		{
			accessor: 'last_name',
			title: 'Último Nome',
		},
		{
			accessor: 'email',
			title: 'Email',
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
