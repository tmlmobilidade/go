'use client';

import { openOrganizationsCreateModal } from '@/components/organizations/create/OrganizationsCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, LoadingActivity, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { OrganizationsListFilterSearch } from '../OrganizationsListFilterSearch';
import { useOrganizationsListData } from '../use-organizations-list-data';

/* * */

export function OrganizationsListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { isLoading, isValidating, timestamp } = useOrganizationsListData();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('default:organizations.list.header.title')}</Label>
			<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />
			<Spacer />
			<OrganizationsListFilterSearch />
			<Button
				icon={<IconPlus size={20} />}
				label={t('default:organizations.list.header.NewOrganizationButton.label')}
				onClick={openOrganizationsCreateModal}
			/>
		</Toolbar>
	);
}
