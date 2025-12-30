/* * */

import { openCreateStopModal } from '@/components/stops/create/StopCreate.modal';
import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Button, HasPermission, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function StopsListHeader() {
	//

	//
	// A. Setup variables

	const stopsListContext = useStopsListContext();
	const { t } = useTranslation('stops', { keyPrefix: 'list.header' });

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps>{t('title')}</Label>
			<Spacer />
			<SearchInput onChange={stopsListContext.actions.setFilterSearch} value={stopsListContext.filters.search} />
			<HasPermission action={PermissionCatalog.all.stops.actions.create} scope={PermissionCatalog.all.stops.scope}>
				<Button label={t('newStop')} leftSection={<IconPlus size={20} />} onClick={openCreateStopModal} />
			</HasPermission>
		</Toolbar>
	);

	//
}
