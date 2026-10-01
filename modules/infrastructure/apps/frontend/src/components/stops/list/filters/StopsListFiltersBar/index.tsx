'use client';

import { FiltersBar } from '@tmlmobilidade/ui';

import { StopsListFilterAgency } from '../StopsListFilterAgency';
import { StopsListFilterConnections } from '../StopsListFilterConnections';
import { StopsListFilterFacilities } from '../StopsListFilterFacilities';
import { StopsListFilterLifecycleStatus } from '../StopsListFilterLifecycleStatus';
import { StopsListFilterLocationNeighbourhood } from '../StopsListFilterLocationNeighberhood';
import { StopsListFilterLocationPrimary } from '../StopsListFilterLocationPrimary';
import { StopsListFilterLocationSecondary } from '../StopsListFilterLocationSecondary';
import { StopsListFilterLocationTertiary } from '../StopsListFilterLocationTertiary';

/* * */

export function StopsListFiltersBar() {
	return (
		<FiltersBar>
			<StopsListFilterAgency />
			<StopsListFilterLocationPrimary />
			<StopsListFilterLocationSecondary />
			<StopsListFilterLocationTertiary />
			<StopsListFilterLocationNeighbourhood />
			<StopsListFilterLifecycleStatus />
			<StopsListFilterFacilities />
			<StopsListFilterConnections />
		</FiltersBar>
	);
}
