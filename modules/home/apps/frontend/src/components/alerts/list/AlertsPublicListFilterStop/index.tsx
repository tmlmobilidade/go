/* * */

import { useAlertsPublicListContext } from '@/contexts/AlertsPublicList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsPublicListFilterStop() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { filters } = useAlertsPublicListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={filters.stop.isActive}
			disabled={!filters.stop.options.length}
			label={t('shared:home.alerts.public.list.filters.stop')}
			onChange={filters.stop.set}
			options={filters.stop.options}
			withToggleAll
		/>
	);

	//
}
