/* * */

import { ListHeader, LoadingActivity } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { AlertsListFilterSearch } from '../filters/AlertsListFilterSearch';
import { useAlertsListData } from '../use-alerts-list-data';

/* * */

export function AlertsListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data, isLoading, isValidating, timestamp } = useAlertsListData();

	//
	// B. Render components

	return (
		<ListHeader
			activity={<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />}
			count={data?.length}
			search={<AlertsListFilterSearch />}
			title={t('alerts:list.AlertsListHeader.title')}
		/>
	);
}
