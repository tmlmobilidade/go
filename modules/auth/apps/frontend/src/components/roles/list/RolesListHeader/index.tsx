'use client';

/* * */

import { openCreateRoleModal } from '@/components/roles/create/RoleCreate.modal';
import { useRolesListContext } from '@/components/roles/list/RolesList.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RolesListHeader() {
	//

	//
	// A. Setup variables

	const roleListContext = useRolesListContext();
	const { t } = useTranslation('auth', { keyPrefix: 'roles.list.header' });

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('title')}</Label>
			<Spacer />
			<SearchInput onChange={roleListContext.actions.setFilterSearch} value={roleListContext.filters.search} />
			<Button icon={<IconPlus size={20} />} label={t('new_role_button_label')} onClick={openCreateRoleModal} />
		</Toolbar>
	);

	//
}
