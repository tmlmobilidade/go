'use client';

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsListFilterEquipment } from './use-stops-list-filter-equipment';

/* * */

export function StopsListFilterEquipment() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterEquipment = useStopsListFilterEquipment();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterEquipment.isActive}
			label={t('default:stops.list.FilterEquipment.label')}
			onChange={filterEquipment.set}
			options={filterEquipment.options}
			isMultiple
			withToggleAll
		/>
	);
}
