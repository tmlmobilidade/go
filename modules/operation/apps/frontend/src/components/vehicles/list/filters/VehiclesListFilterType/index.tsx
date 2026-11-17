/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useVehiclesListFilterType } from './use-vehicles-list-filters-type';

/* * */

export function VehiclesListFilterType() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterType = useVehiclesListFilterType();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterType.isActive}
			label={t('default:vehicles.list.VehiclesListFilterType.label')}
			onChange={filterType.set}
			options={filterType.options}
			isMultiple
			withToggleAll
		/>
	);
}
