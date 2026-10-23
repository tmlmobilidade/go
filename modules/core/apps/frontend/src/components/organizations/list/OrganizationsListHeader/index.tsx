'use client';

import { openOrganizationsCreateModal } from '@/components/organizations/create/OrganizationsCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { Button, ListHeader, LoadingActivity } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { OrganizationsListFilterSearch } from '../OrganizationsListFilterSearch';
import { useOrganizationsListData } from '../use-organizations-list-data';

/* * */

export function OrganizationsListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data, isLoading, isValidating, timestamp } = useOrganizationsListData();

	//
	// B. Render components

	return (
		<ListHeader
			activity={<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />}
			count={data?.length}
			search={<OrganizationsListFilterSearch />}
			title={t('default:organizations.list.header.title')}
			actions={(
				<Button
					icon={<IconPlus size={20} />}
					label={t('default:organizations.list.header.NewOrganizationButton.label')}
					onClick={openOrganizationsCreateModal}
				/>
			)}
		/>
	);
}
