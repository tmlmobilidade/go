/* * */

import { openCreateScheduledAlertModal } from '@/components/scheduled/create/ScheduledAlertCreate.modal';
import { useAlertsListContext } from '@/components/scheduled/list/AlertsList.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsListHeader() {
	//

	//
	// A. Setup variables

	const alertsListContext = useAlertsListContext();

	const { t } = useTranslation('alerts', { keyPrefix: 'scheduled.list.header' });
	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('title')}</Label>
			<Spacer />
			<SearchInput onChange={alertsListContext.actions.setFilterSearch} value={alertsListContext.filters.search} />
			<Button icon={<IconPlus size={20} />} label={t('new_alert')} onClick={openCreateScheduledAlertModal} />
		</Toolbar>
	);

	//
}
