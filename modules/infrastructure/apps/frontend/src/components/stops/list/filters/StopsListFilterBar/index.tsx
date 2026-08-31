'use client';

import { StopsListFilterAgency } from '@/components/stops/list/filters/StopsListFilterAgency';
import { StopsListFilterConnections } from '@/components/stops/list/filters/StopsListFilterConnections';
// import { StopsListFilterDistrict } from '@/components/stops/list/StopsListFilterDistrict';
import { StopsListFilterEquipment } from '@/components/stops/list/filters/StopsListFilterEquipment';
import { StopsListFilterFacilities } from '@/components/stops/list/filters/StopsListFilterFacilities';
// import { StopsListFilterParish } from '@/components/stops/list/StopsListFilterParishes';
import { StopsListFilterLifecycleStatus } from '@/components/stops/list/filters/StopsListFilterLifecycleStatus';
import { StopsListFilterMunicipality } from '@/components/stops/list/filters/StopsListFilterMunicipality';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function StopsListFilterBar() {
	return (
		<FiltersBar>
			<StopsListFilterAgency />
			<StopsListFilterLifecycleStatus />
			<StopsListFilterFacilities />
			<StopsListFilterConnections />
			<StopsListFilterEquipment />
			{/* <StopsListFilterDistrict /> */}
			<StopsListFilterMunicipality />
			{/* <StopsListFilterParish /> */}
		</FiltersBar>
	);
}
