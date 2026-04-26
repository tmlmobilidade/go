'use client';

/* * */

import { useReferencesEditorContext } from '@/components/common/references/ReferencesEditor.context';
import { ReferencesEditorRidesFilters } from '@/components/common/references/ReferencesEditorRidesFilters';
import { ReferencesEditorRidesList } from '@/components/common/references/ReferencesEditorRidesList';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { useDataRides } from '@tmlmobilidade/ui';
import { useEffect, useMemo, useState } from 'react';

/* * */

export function ReferencesEditorRides() {
	//

	//
	// A. Setup variables

	const referencesEditorContext = useReferencesEditorContext();

	const [viewMode, setViewMode] = useState<'all' | 'selected'>('all');
	const [searchFilterValue, setSearchFilterValue] = useState<string>();
	const [lineIdsFilterValue, setLineIdsFilterValue] = useState<string[]>();
	const [stopIdsFilterValue, setStopIdsFilterValue] = useState<string[]>();

	//
	// B. Fetch data

	const { isLoading: filteredRidesLoading, raw: filteredRidesData } = useDataRides(API_ROUTES.alerts.RIDES_LIST, {
		filters: {
			agency_ids: [referencesEditorContext.data.selected_agency_id],
			date_end: referencesEditorContext.data.active_period_end_date,
			date_start: referencesEditorContext.data.active_period_start_date,
			line_ids: lineIdsFilterValue,
			operational_statuses: ['running', 'missed', 'scheduled'],
			search: searchFilterValue,
			stop_ids: stopIdsFilterValue,
		},
	});

	//
	// C. Transform data

	const visibleRides = useMemo(() => {
		if (viewMode === 'all') return filteredRidesData;
		return referencesEditorContext.data.selected_rides_data;
	}, [filteredRidesData, referencesEditorContext.data.selected_rides_data, viewMode]);

	//
	// D. Handle actions

	useEffect(() => {
		// Skip if no selected references
		if (!referencesEditorContext.data.selected_references.length) return;
		// Set filter mode to 'all' if there are no selected references
		setViewMode('all');
	}, [referencesEditorContext.data.selected_references.length]);

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
				isLoading={filteredRidesLoading}
				ridesData={visibleRides}
			/>

		</>
	);

	//
}
