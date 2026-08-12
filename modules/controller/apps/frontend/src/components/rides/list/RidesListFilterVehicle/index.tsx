/* * */

import { TextFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesListFilterVehicle } from './use-rides-list-filter-vehicle';

/* * */

export function RidesListFilterVehicle() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterVehicle = useRidesListFilterVehicle();

	//
	// B. Render components

	return (
		<TextFilter
			active={filterVehicle.isActive}
			label={t('default:list.RidesListFilterVehicle.label')}
			onChange={filterVehicle.set}
			value={filterVehicle.value}
		/>
	);
}
