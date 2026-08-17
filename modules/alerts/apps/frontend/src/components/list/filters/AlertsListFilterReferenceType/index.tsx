/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAlertsListFilterReferenceType } from './use-alerts-list-filter-reference-type';

/* * */

export function AlertsListFilterReferenceType() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterReferenceType = useAlertsListFilterReferenceType();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterReferenceType.isActive}
			label={t('default:list.AlertsListFilterReferenceType.label')}
			onChange={filterReferenceType.set}
			options={filterReferenceType.options}
			disabled
			withToggleAll
		/>
	);
}
