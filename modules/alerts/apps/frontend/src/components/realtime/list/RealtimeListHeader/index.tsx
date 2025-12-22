/* * */

import { useRealtimeListContext } from '@/contexts/RealtimeList.context';
import { IconPlus } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RealtimeListHeader() {
	//

	//
	// A. Setup variables

	const realtimeListContext = useRealtimeListContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'realtime.list.header' });

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('title')}</Label>
			<Spacer />
			<SearchInput onChange={realtimeListContext.actions.setFilterSearch} value={realtimeListContext.filters.search} />
			<Button href={PAGE_ROUTES.alerts.REALTIME_DETAIL('new')} label={t('new_alert')} leftSection={<IconPlus size={20} />} />
		</Toolbar>
	);

	//
}
