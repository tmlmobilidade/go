/* * */

import { FiltersBar } from '@tmlmobilidade/ui';

import { VehiclesListFilterAgency } from '../VehiclesListFilterAgency';
import { VehiclesListFilterEmission } from '../VehiclesListFilterEmission';
import { VehiclesListFilterPropulsion } from '../VehiclesListFilterPropulsion';
import { VehiclesListFilterType } from '../VehiclesListFilterType';

/* * */

export function VehiclesListFiltersBar() {
	return (
		<FiltersBar>
			<VehiclesListFilterAgency />
			<VehiclesListFilterEmission />
			<VehiclesListFilterPropulsion />
			<VehiclesListFilterType />
		</FiltersBar>
	);
}
