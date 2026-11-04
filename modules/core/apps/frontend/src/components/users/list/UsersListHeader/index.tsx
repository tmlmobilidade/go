'use client';

import { openUsersCreateModal } from '@/components/users/create/UsersCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { Button, ListHeader, LoadingActivity } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useUsersListData } from '../use-users-list-data';
import { UsersListFilterSearch } from '../UsersListFilterSearch';

/* * */

export function UsersListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data, isLoading, isValidating, timestamp } = useUsersListData();

	//
	// B. Render components

	return (
		<ListHeader
			activity={<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />}
			count={data?.length}
			search={<UsersListFilterSearch />}
			title={t('default:users.list.Header.title')}
			actions={(
				<Button
					icon={<IconPlus size={20} />}
					label={t('default:users.list.Header.NewUserButton.label')}
					onClick={openUsersCreateModal}
				/>
			)}
		/>
	);
}
