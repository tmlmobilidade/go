/* * */

import { StopListFilterDistrict } from './StopListFilterDistrict';
import { StopListFilterMunicipality } from './StopListFilterMuncipality';
import { StopListFilterParish } from './StopListFilterParishes';

/* * */

export function StopListFilterLocations() {
	return (
		<>
			<StopListFilterDistrict />
			<StopListFilterMunicipality />
			<StopListFilterParish />
		</>
	);
}
