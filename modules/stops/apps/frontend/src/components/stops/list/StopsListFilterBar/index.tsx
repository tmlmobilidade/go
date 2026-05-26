'use client';

import { StopsListFilterAgencies } from '@/components/stops/list/StopsListFilterAgencies';
import { StopsListFilterConnections } from '@/components/stops/list/StopsListFilterConnections';
// import { StopsListFilterDistrict } from '@/components/stops/list/StopsListFilterDistrict';
import { StopsListFilterEquipment } from '@/components/stops/list/StopsListFilterEquipment';
import { StopsListFilterFacilities } from '@/components/stops/list/StopsListFilterFacilities';
// import { StopsListFilterMunicipality } from '@/components/stops/list/StopsListFilterMuncipality';
// import { StopsListFilterParish } from '@/components/stops/list/StopsListFilterParishes';
import { StopsListFilterLifecycleStatus } from '@/components/stops/list/StopsListFilterLifecycleStatus';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function StopsListFilterBar() {
	return (
		<FiltersBar>
			<StopsListFilterAgencies />
			<StopsListFilterLifecycleStatus />
			<StopsListFilterFacilities />
			<StopsListFilterConnections />
			<StopsListFilterEquipment />
			{/* <StopsListFilterDistrict /> */}
			{/* <StopsListFilterMunicipality /> */}
			{/* <StopsListFilterParish /> */}
		</FiltersBar>
	);
}
