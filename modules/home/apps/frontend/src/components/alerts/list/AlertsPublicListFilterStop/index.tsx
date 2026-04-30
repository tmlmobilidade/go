// /* * */

// import { useAlertsListContext } from '@/contexts/AlertsList.context';
// import { FilterTypeList } from '@tmlmobilidade/ui';
// import { useTranslation } from 'react-i18next';

// /* * */

// export function AlertsPublicListFilterStop() {
// 	//

// 	//
// 	// A. Setup variables

// 	const { t } = useTranslation();
// 	const alertsListContext = useAlertsListContext();

// 	//
// 	// B. Render components

// 	return (
// 		<FilterTypeList
// 			active={alertsListContext.filters.stop.isActive}
// 			disabled={!alertsListContext.filters.stop.options.length}
// 			label={t('shared:home.alerts.public.list.filters.stop')}
// 			onChange={alertsListContext.filters.stop.set}
// 			options={alertsListContext.filters.stop.options}
// 			withToggleAll
// 		/>
// 	);

// 	//
// }
