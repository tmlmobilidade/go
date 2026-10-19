/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAlertsListFilterPublishStatus } from './use-alerts-list-filter-publish-status';

/* * */

export function AlertsListFilterPublishStatus() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterPublishStatus = useAlertsListFilterPublishStatus();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterPublishStatus.isActive}
			label={t('alerts:list.filters.publish_status.label')}
			onChange={filterPublishStatus.set}
			options={filterPublishStatus.options}
			withToggleAll
		/>
	);
}
