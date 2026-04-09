/* * */

import { useAlertsPublicListContext } from '@/contexts/AlertsPublicList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsPublicListFilterAgency() {
	const { t } = useTranslation();
	const { filters } = useAlertsPublicListContext();

	return (
		<FilterTypeList
			active={filters.agency.isActive}
			disabled={!filters.agency.options.length}
			label={t('default:alerts.public.list.filters.agency')}
			onChange={filters.agency.set}
			options={filters.agency.options}
			withToggleAll
		/>
	);
}
