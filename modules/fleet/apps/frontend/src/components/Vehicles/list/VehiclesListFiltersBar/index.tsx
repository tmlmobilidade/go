/* * */

import { VehiclesListFilterAgencies } from '@/components/Vehicles/list/VehicleListFilterAgencies';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function VehiclesListFiltersBar() {
	return (
		<FiltersBar>
			<VehiclesListFilterAgencies />
		</FiltersBar>
	);
}
