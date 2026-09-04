/* * */

import { Label, LoadingActivity, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { AlertsListFilterSearch } from '../filters/AlertsListFilterSearch';
import { useAlertsListData } from '../use-alerts-list-data';

/* * */

export function AlertsListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { isLoading, isValidating, timestamp } = useAlertsListData();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps>{t('alerts:list.AlertsListHeader.title')}</Label>
			<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />
			<Spacer shrink />
			<AlertsListFilterSearch />
		</Toolbar>
	);
}
