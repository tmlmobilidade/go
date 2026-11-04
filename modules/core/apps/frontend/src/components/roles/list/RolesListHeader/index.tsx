'use client';

import { openRolesCreateModal } from '@/components/roles/create/RolesCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { Button, ListHeader, LoadingActivity } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { RolesListFilterSearch } from '../RolesListFilterSearch';
import { useRolesListData } from '../use-roles-list-data';

/* * */

export function RolesListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data, isLoading, isValidating, timestamp } = useRolesListData();

	//
	// B. Render components

	return (
		<ListHeader
			activity={<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />}
			count={data?.length}
			search={<RolesListFilterSearch />}
			title={t('default:roles.list.Header.title')}
			actions={(
				<Button
					icon={<IconPlus size={20} />}
					label={t('default:roles.list.Header.NewRoleButton.label')}
					onClick={openRolesCreateModal}
				/>
			)}
		/>
	);
}
