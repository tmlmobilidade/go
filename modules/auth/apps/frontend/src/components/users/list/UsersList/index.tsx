'use client';

/* * */

import { UsersListFieldOrganization } from '@/components/users/list/UsersListFieldOrganization';
import { UsersListFieldRole } from '@/components/users/list/UsersListFieldRole';
import { UsersListFilterBar } from '@/components/users/list/UsersListFilterBar';
import { UsersListHeader } from '@/components/users/list/UsersListHeader';
import { useUsersListContext } from '@/contexts/UsersList.context';
import { type UserNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { DataTable, type DataTableColumn, ErrorDisplay, LoadingOverlay, Pane, Tag } from '@tmlmobilidade/ui';
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
			width: 250,
		},
		{
			accessor: 'role_ids',
			render: item => item.role_ids.map(role => <UsersListFieldRole key={role} role_id={role} />),
			title: 'Grupos',
			width: 200,
		},
		{
			accessor: 'organization_id',
			render: item => <UsersListFieldOrganization organizationId={item.organization_id} />,
			title: 'Organização',
			width: 300,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: UserNormalized) => {
		router.push(PAGE_ROUTES.auth.USERS_DETAIL(item._id) + window.location.search);
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
