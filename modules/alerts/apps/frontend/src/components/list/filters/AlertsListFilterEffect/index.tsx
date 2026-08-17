/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAlertsListFilterEffect } from './use-alerts-list-filter-effect';

/* * */

export function AlertsListFilterEffect() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterEffect = useAlertsListFilterEffect();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterEffect.isActive}
			label={t('alerts:list.filters.effect.label')}
			onChange={filterEffect.set}
			options={filterEffect.options}
			disabled
			withToggleAll
		/>
	);
}
