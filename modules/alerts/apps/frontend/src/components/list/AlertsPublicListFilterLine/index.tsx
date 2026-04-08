/* * */

import { useAlertsPublicListContext } from '@/contexts/AlertsPublicList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsPublicListFilterLine() {
	const { t } = useTranslation();
	const { filters } = useAlertsPublicListContext();

	return (
		<FilterTypeList
			active={filters.line.isActive}
			disabled={!filters.line.options.length}
			label={t('default:alerts.public.list.filters.line')}
			onChange={filters.line.set}
			options={filters.line.options}
			withToggleAll
		/>
	);
}
