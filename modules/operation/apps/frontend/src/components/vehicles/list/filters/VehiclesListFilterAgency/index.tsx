/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useVehiclesListFilterAgency } from './use-vehicles-list-filter-agency';

/* * */

export function VehiclesListFilterAgency() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterAgency = useVehiclesListFilterAgency();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterAgency.isActive}
			label={t('default:vehicles.list.VehiclesListFilterAgency.label')}
			onChange={filterAgency.set}
			options={filterAgency.options}
			isMultiple
			withToggleAll
		/>
	);
}
