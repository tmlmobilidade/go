/* * */

import { FiltersBar } from '@tmlmobilidade/ui';

import { VehiclesListFilterAgency } from '../VehiclesListFilterAgency';
import { VehiclesListFilterType } from '../VehiclesListFilterType';

/* * */

export function VehiclesListFiltersBar() {
	return (
		<FiltersBar>
			<VehiclesListFilterAgency />
			<VehiclesListFilterType />
		</FiltersBar>
	);
}
