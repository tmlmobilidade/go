'use client';

import { ReferencesEditorRidesFilters } from '@/components/references/rides/ReferencesEditorRidesFilters';
import { ReferencesEditorRidesList } from '@/components/references/rides/ReferencesEditorRidesList';
import { useReferencesEditorContext } from '@/components/references/shared/ReferencesEditor.context';
import { useMemo, useState } from 'react';

import { useAlertsRidesData } from '../use-alerts-rides-data';

/* * */

export function ReferencesEditorRides() {
	//

	//
	// A. Setup variables

	const referencesEditorContext = useReferencesEditorContext();

	const { data: alertsRidesData, isLoading: alertsRidesLoading } = useAlertsRidesData();

	const [viewMode, setViewMode] = useState<'all' | 'selected'>('all');
	const [searchFilterValue, setSearchFilterValue] = useState<string>();
	const [lineIdsFilterValue, setLineIdsFilterValue] = useState<string[]>();
	const [stopIdsFilterValue, setStopIdsFilterValue] = useState<string[]>();

	//
	// B. Transform data

	const visibleRides = useMemo(() => {
		if (viewMode === 'all') return alertsRidesData;
		return referencesEditorContext.data.selected_references.map(reference => alertsRidesData?.find(ride => ride._id === reference.child_ids[0]));
	}, [alertsRidesData, referencesEditorContext.data.selected_references, viewMode]);

	//
	// E. Render components

	return (
		<>

			<ReferencesEditorRidesFilters
				lineIdsFilterValue={lineIdsFilterValue}
				searchFilterValue={searchFilterValue}
				setLineIdsFilterValue={setLineIdsFilterValue}
				setSearchFilterValue={setSearchFilterValue}
				setStopIdsFilterValue={setStopIdsFilterValue}
				setViewMode={setViewMode}
				stopIdsFilterValue={stopIdsFilterValue}
				viewMode={viewMode}
			/>

			<ReferencesEditorRidesList
				isLoading={alertsRidesLoading}
				ridesData={visibleRides}
			/>

		</>
	);

	//
}
