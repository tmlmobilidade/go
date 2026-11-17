/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useVehiclesListFilterPropulsion } from './use-vehicles-list-filters-propulsion';

/* * */

export function VehiclesListFilterPropulsion() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterPropulsion = useVehiclesListFilterPropulsion();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterPropulsion.isActive}
			label={t('default:vehicles.list.VehiclesListFilterPropulsion.label')}
			onChange={filterPropulsion.set}
			options={filterPropulsion.options}
			isMultiple
			withToggleAll
		/>
	);
}
