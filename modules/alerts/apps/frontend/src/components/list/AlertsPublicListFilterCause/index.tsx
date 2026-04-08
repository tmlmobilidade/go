/* * */

import { useAlertsPublicListContext } from '@/contexts/AlertsPublicList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertsPublicListFilterCause() {
	const { t } = useTranslation();
	const alertsPublicListContext = useAlertsPublicListContext();

	return (
		<FilterTypeList
			active={alertsPublicListContext.filters.cause.isActive}
			label={t('default:alerts.public.list.filters.cause')}
			onChange={alertsPublicListContext.filters.cause.set}
			options={alertsPublicListContext.filters.cause.options}
			withToggleAll
		/>
	);
}
