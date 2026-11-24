'use client';

import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, ListHeader, LoadingActivity, SearchField } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useListFilters } from '../../../shared/use-list-filters';
import { openChangelogCreateModal } from '../../create/ChangelogCreate.modal';
import { useChangelogListData } from '../use-changelog-list-data';

/* * */

export function ChangelogListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data, isLoading, isValidating, timestamp } = useChangelogListData();
	const { search } = useListFilters();

	//
	// B. Render components

	return (
		<ListHeader
			activity={<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />}
			count={data.length}
			search={<SearchField onChange={search.set} value={search.value} />}
			title={t('default:dev.changelog.title')}
			actions={(
				<HasPermission action={PermissionCatalog.all.changelogs.actions.update} scope={PermissionCatalog.all.changelogs.scope}>
					<Button icon={<IconPlus size={20} />} label={t('default:dev.changelog.create')} onClick={openChangelogCreateModal} />
				</HasPermission>
			)}
		/>
	);
}
