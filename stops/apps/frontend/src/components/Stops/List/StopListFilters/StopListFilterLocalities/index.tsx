/* * */

import { LocationsContextProvider } from '@/contexts/Locations.context';

import { StopListFilterDistrict } from './StopListFilterDistrict';
import { StopListFilterMunicipality } from './StopListFilterMuncipality';
import { StopListFilterParish } from './StopListFilterParishes';

/* * */

export function StopListFilterLocations() {
	return (
		<LocationsContextProvider>
			<StopListFilterDistrict />
			<StopListFilterMunicipality />
			<StopListFilterParish />
		</LocationsContextProvider>
	);
}
