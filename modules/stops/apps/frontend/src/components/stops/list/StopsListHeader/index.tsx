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
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps>{t('stops:stops.list.Header.title')}</Label>
			<Spacer />
			<SearchInput onChange={stopsListContext.actions.setFilterSearch} value={stopsListContext.filters.search} />
			<HasPermission action={PermissionCatalog.all.stops.actions.create} scope={PermissionCatalog.all.stops.scope}>
				<Button label={t('stops:stops.list.Header.new_stop_button')} leftSection={<IconPlus size={20} />} onClick={openCreateStopModal} />
			</HasPermission>
		</Toolbar>
	);

	//
}
