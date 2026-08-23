'use client';

import { UsersListHeader } from '@/components/users/list/UsersListHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { UsersListItem } from '@tmlmobilidade/go-core-pckg-types';
import { DataTable, type DataTableColumn, ErrorDisplay, IdTag, keepUrlParams, Pane, UnixTimestampDisplay } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useUsersDetailUserId } from '../../detail/use-users-detail-user-id';
import { useUsersListData } from '../use-users-list-data';

/* * */

export function UsersList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const router = useRouter();

	const { userId } = useUsersDetailUserId();

	const usersData = useUsersListData();

	const columns: DataTableColumn<UsersListItem>[] = [
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
		// {
		// 	accessor: 'organization_id',
		// 	render: item => <Tag label={organizationsContext.data.raw.find(organizationData => organizationData._id === item.organization_id)?.long_name} variant="secondary" />,
		// 	title: t('default:users.list.Table.columns.organizationId.label'),
		// 	width: 300,
		// },
		// {
		// 	accessor: 'user_ids',
		// 	render: item => <TagGroup tags={item.user_ids.map(userId => ({ label: usersContext.data.raw.find(userData => userData._id === userId)?.name, variant: 'secondary' }))} />,
		// 	title: t('default:users.list.Table.columns.userIds.label'),
		// 	width: 500,
		// },
		{
			accessor: 'seen_last_at',
			render: item => item.seen_last_at && <UnixTimestampDisplay value={item.seen_last_at} showDate />,
			title: t('default:users.list.Table.columns.lastSeenAt.label'),
			width: 200,
		},
	];

	//
	// B. Handle actions

	const handleRowClick = (item: UsersListItem) => {
		router.push(keepUrlParams(PAGE_ROUTES.core.ROLES_DETAIL(item._id)));
	};

	//
	// C. Render components

	return (
		<Pane header={[<UsersListHeader key="header" />]}>
			{usersData.error && <ErrorDisplay message={usersData.error} />}
			<DataTable
				columns={columns}
				isLoading={usersData.isLoading}
				onRowClick={handleRowClick}
				records={usersData.data}
				rowIdAccessor="_id"
				selectedId={userId}
			/>
		</Pane>
	);
}
