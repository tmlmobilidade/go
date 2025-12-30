'use client';

/* * */

import { openCreateOrganizationModal } from '@/components/organizations/create/OrganizationCreate.modal';
import { useOrganizationsListContext } from '@/components/organizations/list/OrganizationsList.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function OrganizationsListHeader() {
	//

	//
	// A. Setup variables

	const organizationsListContext = useOrganizationsListContext();

	const { t } = useTranslation('auth', { keyPrefix: 'organizations.list.header' });

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('title')}</Label>
			<Spacer />
			<SearchInput onChange={organizationsListContext.actions.setFilterSearch} value={organizationsListContext.filters.search} />
			<Button icon={<IconPlus size={20} />} label={t('newOrganizationButtonLabel')} onClick={openCreateOrganizationModal} />
		</Toolbar>
	);

	//
}
