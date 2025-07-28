import { FiltersBar } from '@tmlmobilidade/ui';

import { StopListFilterConnections } from '../StopListFilterConnections';
import { StopListFilterEquipment } from '../StopListFilterEquipment';
import { StopListFilterFacilities } from '../StopListFilterFacilities';
import { StopListFilterLocations } from '../StopListFilterLocalities';

/* * */

export function StopListFilterBar() {
	return (
		<FiltersBar>
			<StopListFilterFacilities />
			<StopListFilterConnections />
			<StopListFilterEquipment />
			{/* <StopListFilterLocations /> */}
		</FiltersBar>
	);
}
