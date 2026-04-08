/* * */

import { useAlertsPublicListContext } from '@/contexts/AlertsPublicList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsPublicListFilterEffect() {
	const { t } = useTranslation();
	const alertsPublicListContext = useAlertsPublicListContext();

	return (
		<FilterTypeList
			active={alertsPublicListContext.filters.effect.isActive}
			label={t('default:alerts.public.list.filters.effect')}
			onChange={alertsPublicListContext.filters.effect.set}
			options={alertsPublicListContext.filters.effect.options}
			withToggleAll
		/>
	);
}
