'use client';

import { FiltersBar } from '@tmlmobilidade/ui';

import { StopsListFilterAgency } from '../StopsListFilterAgency';
import { StopsListFilterConnections } from '../StopsListFilterConnections';
import { StopsListFilterFacilities } from '../StopsListFilterFacilities';
import { StopsListFilterLegacyId } from '../StopsListFilterLegacyId';
import { StopsListFilterLifecycleStatus } from '../StopsListFilterLifecycleStatus';
import { StopsListFilterLocationPrimary } from '../StopsListFilterLocationPrimary';
import { StopsListFilterLocationSecondary } from '../StopsListFilterLocationSecondary';
import { StopsListFilterLocationTertiary } from '../StopsListFilterLocationTertiary';

/* * */

export function StopsListFiltersBar() {
	return (
		<FiltersBar>
			<StopsListFilterAgency />
			<StopsListFilterLegacyId />
			<StopsListFilterLocationPrimary />
			<StopsListFilterLocationSecondary />
			<StopsListFilterLocationTertiary />
			<StopsListFilterLifecycleStatus />
			<StopsListFilterFacilities />
			<StopsListFilterConnections />
		</FiltersBar>
	);
}
