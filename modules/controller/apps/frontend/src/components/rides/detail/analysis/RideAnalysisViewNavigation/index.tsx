'use client';

import { RideAnalysisViewOptions, useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { SegmentedControl, Spacer, Toolbar, useMeContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function RideAnalysisViewNavigation() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const rideAnalysisContext = useRideAnalysisContext();

	//
	// B. Transform data

	const viewOptions = useMemo(() => {
		return Object
			.values(RideAnalysisViewOptions)
			.filter(option => meContext.actions.hasPermission(PermissionCatalog.all.rides.scope, option.permission))
			.map(option => ({ label: option.label, value: option.value }));
	}, [meContext.data.user.permissions]);

	//
	// C. Handle actions

	const handleChangeView = (value: keyof typeof RideAnalysisViewOptions) => {
		rideAnalysisContext.actions.setSelectedView(value);
	};

	//
	// D. Render components

	return (
		<Toolbar>
			<Spacer />
			<SegmentedControl
				data={viewOptions}
				onChange={handleChangeView}
				value={rideAnalysisContext.data.selected_view}
			/>
		</Toolbar>
	);

	//
}
