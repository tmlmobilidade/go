'use client';

import { FiltersBar } from '@tmlmobilidade/ui';

import { StopsListFilterAgency } from '../StopsListFilterAgency';
import { StopsListFilterConnections } from '../StopsListFilterConnections';
import { StopsListFilterDistrict } from '../StopsListFilterDistrict';
import { StopsListFilterEquipment } from '../StopsListFilterEquipment';
import { StopsListFilterFacilities } from '../StopsListFilterFacilities';
import { StopsListFilterLifecycleStatus } from '../StopsListFilterLifecycleStatus';
import { StopsListFilterLocality } from '../StopsListFilterLocality';
import { StopsListFilterMunicipality } from '../StopsListFilterMunicipality';
import { StopsListFilterParish } from '../StopsListFilterParish';

/* * */

export function StopsListFilterBar() {
	return (
		<FiltersBar>
			<StopsListFilterAgency />
			<StopsListFilterLifecycleStatus />
			<StopsListFilterFacilities />
			<StopsListFilterConnections />
			<StopsListFilterEquipment />
			<StopsListFilterDistrict />
			<StopsListFilterMunicipality />
			<StopsListFilterParish />
			<StopsListFilterLocality />
		</FiltersBar>
	);
}
