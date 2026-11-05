'use client';

import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, ListHeader, LoadingActivity, SearchField } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useListFilters } from '../../../shared/use-list-filters';
import { openBannersCreateModal } from '../../create/BannersCreate.modal';
import { useBannersListData } from '../use-banners-list-data';

/* * */

export function BannersListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data, isLoading, isValidating, timestamp } = useBannersListData();
	const { search } = useListFilters();

	//
	// B. Render components

	return (
		<ListHeader
			activity={<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />}
			count={data.length}
			search={<SearchField onChange={search.set} value={search.value} />}
			title={t('default:dev.banners.title')}
			actions={(
				<HasPermission action={PermissionCatalog.all.banners.actions.update} scope={PermissionCatalog.all.banners.scope}>
					<Button icon={<IconPlus size={20} />} label={t('default:dev.banners.create')} onClick={openBannersCreateModal} />
				</HasPermission>
			)}
		/>
	);
}
