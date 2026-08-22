'use client';

import { openCreateRoleModal } from '@/components/roles/create/RoleCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, LoadingActivity, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { RolesListFilterSearch } from '../RolesListFilterSearch';
import { useRolesListData } from '../use-roles-list-data';

/* * */

export function RolesListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { isLoading, isValidating, timestamp } = useRolesListData();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('default:roles.list.Header.title')}</Label>
			<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />
			<Spacer />
			<RolesListFilterSearch />
			<Button icon={<IconPlus size={20} />} label={t('default:roles.list.Header.NewRoleButton.label')} onClick={openCreateRoleModal} />
		</Toolbar>
	);

	//
}
