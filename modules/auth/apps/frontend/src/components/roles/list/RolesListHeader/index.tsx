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
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('default:roles.list.Header.title')}</Label>
			<Spacer />
			<SearchInput onChange={roleListContext.filters.search.set} value={roleListContext.filters.search.value} />
			<Button icon={<IconPlus size={20} />} label={t('default:roles.list.Header.NewRoleButton.label')} onClick={openCreateRoleModal} />
		</Toolbar>
	);

	//
}
