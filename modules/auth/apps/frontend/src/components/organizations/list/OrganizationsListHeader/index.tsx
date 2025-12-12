'use client';

/* * */

import en from '@/app/translations/en.json';
import pt from '@/app/translations/pt.json';
import { useOrganizationCreateContext } from '@/contexts/OrganizationCreate.context';
import { useOrganizationsListContext } from '@/contexts/OrganizationsList.context';
import { IconPlus } from '@tabler/icons-react';
import { registerModuleTranslations } from '@tmlmobilidade/ui';
import { Button, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

registerModuleTranslations('translation', { en: en, pt: pt });

/* * */

export function OrganizationsListHeader() {
	//

	//
	// A. Setup variables

	const organizationsListContext = useOrganizationsListContext();
	const organizationCreateContext = useOrganizationCreateContext();

	const { t } = useTranslation('translation', { keyPrefix: 'organizations.list.header' });

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('title')}</Label>
			<Spacer />
			<SearchInput onChange={organizationsListContext.actions.setFilterSearch} value={organizationsListContext.filters.search} />
			<Button icon={<IconPlus size={20} />} label="Nova organização" onClick={organizationCreateContext.modal.open} />
		</Toolbar>
	);

	//
}
