'use client';

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

	const { t } = useTranslation();

	const organizationsListContext = useOrganizationsListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('default:organizations.list.header.title')}</Label>
			<Spacer />
			<SearchInput onChange={organizationsListContext.filters.search.set} value={organizationsListContext.filters.search.value} />
			<Button icon={<IconPlus size={20} />} label={t('default:organizations.list.header.NewOrganizationButton.label')} onClick={openCreateOrganizationModal} />
		</Toolbar>
	);

	//
}
