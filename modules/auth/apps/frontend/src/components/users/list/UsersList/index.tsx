'use client';

/* * */

import { UsersListFilterBar } from '@/components/users/list/UsersListFilterBar';
import { UsersListHeader } from '@/components/users/list/UsersListHeader';
import { useOrganizationsContext } from '@/contexts/Organizations.context';
import { useRolesContext } from '@/contexts/Roles.context';
import { useUsersListContext } from '@/contexts/UsersList.context';
import { type UserNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { DataTable, type DataTableColumn, ErrorDisplay, keepUrlParams, LoadingOverlay, Pane, Tag, TagGroup } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function UsersList() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const rolesContext = useRolesContext();
	const organizationsContext = useOrganizationsContext();
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
			width: 225,
		},
		{
			accessor: 'email',
			title: 'Email',
			width: 350,
		},
		{
			accessor: 'organization_id',
			render: item => <Tag label={organizationsContext.data.raw.find(organizationData => organizationData._id === item.organization_id)?.long_name} variant="secondary" />,
			title: 'Organização',
			width: 300,
		},
		{
			accessor: 'role_ids',
			render: item => <TagGroup tags={item.role_ids.map(roleId => ({ label: rolesContext.data.raw.find(roleData => roleData._id === roleId)?.name, variant: 'secondary' }))} />,
			title: 'Grupos',
			width: 500,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: UserNormalized) => {
		const destUrl = keepUrlParams(PAGE_ROUTES.auth.USERS_DETAIL(item._id), window.location.search);
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
