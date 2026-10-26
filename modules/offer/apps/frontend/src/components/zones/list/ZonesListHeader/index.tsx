'use client';

/* * */

import { openCreateZoneModal } from '@/components/zones/create/ZoneCreate.modal';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, ListHeader, SearchField } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useZonesListFilterSearch } from '../filters/ZonesListFilterSearch/use-zones-list-filter-search';
import { useZonesListData } from '../use-zones-list-data';

/* * */

export function ZonesListHeader() {
	//

	//
	// A. Setup variables

	const { data } = useZonesListData();
	const search = useZonesListFilterSearch();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<ListHeader
			count={data.length}
			search={<SearchField onChange={search.set} value={search.value} />}
			title={t('default:zones.list.title')}
			actions={(
				<HasPermission action={PermissionCatalog.all.zones.actions.create} scope={PermissionCatalog.all.zones.scope}>
					<Button label={t('default:zones.create.title')} leftSection={<IconPlus />} onClick={openCreateZoneModal} />
				</HasPermission>
			)}
		/>
	);
}
