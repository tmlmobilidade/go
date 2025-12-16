'use client';

/* * */

import { useOrganizationCreateContext } from '@/contexts/OrganizationCreate.context';
import { useOrganizationsListContext } from '@/contexts/OrganizationsList.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function OrganizationsListHeader() {
	//

	//
	// A. Setup variables

	const organizationsListContext = useOrganizationsListContext();
	const organizationCreateContext = useOrganizationCreateContext();

	const { t } = useTranslation('auth', { keyPrefix: 'organizations.list.header' });

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('title')}</Label>
			<Spacer />
			<SearchInput onChange={organizationsListContext.actions.setFilterSearch} value={organizationsListContext.filters.search} />
			<Button icon={<IconPlus size={20} />} label={t('new_organization_button_label')} onClick={organizationCreateContext.modal.open} />
		</Toolbar>
	);

	//
}
