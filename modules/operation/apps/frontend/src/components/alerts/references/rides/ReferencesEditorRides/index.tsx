'use client';

import { useMemo, useState } from 'react';

import { useReferencesEditorContext } from '../../shared/ReferencesEditor.context';
import { ReferencesEditorRidesFilters } from '../ReferencesEditorRidesFilters';
import { ReferencesEditorRidesList } from '../ReferencesEditorRidesList';
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
		else if (viewMode === 'selected') return referencesEditorContext.data.selected_references
			.map(reference => alertsRidesData?.find(ride => ride._id === reference.parent_id))
			.filter(Boolean);
		else return [];
	}, [alertsRidesData, referencesEditorContext.data.selected_references, viewMode]);

	//
	// C. Render components

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
}
