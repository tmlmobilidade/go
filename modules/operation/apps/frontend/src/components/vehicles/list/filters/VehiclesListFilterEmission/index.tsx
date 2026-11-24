/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useVehiclesListFilterEmission } from './use-vehicles-list-filters-emission';

/* * */

export function VehiclesListFilterEmission() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterEmission = useVehiclesListFilterEmission();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterEmission.isActive}
			label={t('default:vehicles.list.VehiclesListFilterEmission.label')}
			onChange={filterEmission.set}
			options={filterEmission.options}
			isMultiple
			withToggleAll
		/>
	);
}
