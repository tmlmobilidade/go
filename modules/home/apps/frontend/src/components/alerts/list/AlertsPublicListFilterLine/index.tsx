// /* * */

// import { useAlertsListContext } from '@/contexts/AlertsList.context';
// import { FilterTypeList } from '@tmlmobilidade/ui';
// import { useTranslation } from 'react-i18next';

// /* * */

// export function AlertsPublicListFilterLine() {
// 	//

// 	//
// 	// A. Setup variables

// 	const { t } = useTranslation();
// 	const alertsListContext = useAlertsListContext();

// 	//
// 	// B. Render components

// 	return (
// 		<FilterTypeList
// 			active={alertsListContext.filters.line.isActive}
// 			disabled={!alertsListContext.filters.line.options.length}
// 			label={t('shared:home.alerts.public.list.filters.line')}
// 			onChange={alertsListContext.filters.line.set}
// 			options={alertsListContext.filters.line.options}
// 			withToggleAll
// 		/>
// 	);

// 	//
// }
