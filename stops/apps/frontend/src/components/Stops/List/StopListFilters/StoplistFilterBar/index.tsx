import { FiltersBar } from '@tmlmobilidade/ui';

import { StopListFilterConnections } from '../StopListFilterConnections';
import { StopListFilterEquipment } from '../StopListFilterEquipment';
import { StopListFilterFacilities } from '../StopListFilterFacilities';

/* * */

export function StopListFilterBar() {
	return (
		<FiltersBar>
			<StopListFilterFacilities />
			<StopListFilterConnections />
			<StopListFilterEquipment />
		</FiltersBar>
	);
}
