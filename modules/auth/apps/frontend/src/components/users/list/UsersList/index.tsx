'use client';

/* * */

import { useUsersListContext } from '@/components/users/list/UsersList.context';
import { UsersListFilterBar } from '@/components/users/list/UsersListFilterBar';
import { UsersListHeader } from '@/components/users/list/UsersListHeader';
import { useOrganizationsContext } from '@/contexts/Organizations.context';
import { useRolesContext } from '@/contexts/Roles.context';
import { type UserNormalized } from '@/types/normalized';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, keepUrlParams, LoadingOverlay, Pane, Tag, TagGroup } from '@tmlmobilidade/ui';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function UsersList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const router = useRouter();
	const params = useParams<{ id?: string }>();

	const rolesContext = useRolesContext();
	const organizationsContext = useOrganizationsContext();
	const usersListContext = useUsersListContext();

	const columns: DataTableColumn<UserNormalized>[] = [
		{
			accessor: '_id',
			render: item => <IdTag id={item._id} />,
			title: t('default:users.list.Table.columns.id.label'),
			width: 120,
		},
		{
			accessor: 'full_name',
			title: t('default:users.list.Table.columns.name.label'),
			width: 225,
		},
		{
			accessor: 'email',
			title: t('default:users.list.Table.columns.email.label'),
			width: 350,
		},
		{
			accessor: 'organization_id',
			render: item => <Tag label={organizationsContext.data.raw.find(organizationData => organizationData._id === item.organization_id)?.long_name} variant="secondary" />,
			title: t('default:users.list.Table.columns.organizationId.label'),
			width: 300,
		},
		{
			accessor: 'role_ids',
			render: item => <TagGroup tags={item.role_ids.map(roleId => ({ label: rolesContext.data.raw.find(roleData => roleData._id === roleId)?.name, variant: 'secondary' }))} />,
			title: t('default:users.list.Table.columns.roleIds.label'),
			width: 500,
		},
		{
			accessor: 'seen_last_at',
			render: item => item.seen_last_at && <Tag label={Dates.fromUnixTimestamp(item.seen_last_at).toLocaleString(Dates.FORMATS.DATETIME_MEDIUM, 'pt-PT')} variant="secondary" />,
			title: t('default:users.list.Table.columns.lastSeenAt.label'),
			width: 200,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: UserNormalized) => {
		router.push(keepUrlParams(PAGE_ROUTES.auth.USERS_DETAIL(item._id)));
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
			<UsersListHeader key="header" />,
			<UsersListFilterBar key="filters" />,
		]}
		>
			<DataTable
				columns={columns}
				onRowClick={handleRowClick}
				records={usersListContext.data.filtered}
				rowIdAccessor="_id"
				selectedId={params.id}
			/>
		</Pane>
	);

	//
}
