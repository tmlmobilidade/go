'use client';

import { openUsersCreateModal } from '@/components/users/create/UsersCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, LoadingActivity, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useUsersListData } from '../use-users-list-data';
import { UsersListFilterSearch } from '../UsersListFilterSearch';

/* * */

export function UsersListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { isLoading, isValidating, timestamp } = useUsersListData();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('default:users.list.Header.title')}</Label>
			<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />
			<Spacer />
			<UsersListFilterSearch />
			<Button
				icon={<IconPlus size={20} />}
				label={t('default:users.list.Header.NewUserButton.label')}
				onClick={openUsersCreateModal}
			/>
		</Toolbar>
	);
}
