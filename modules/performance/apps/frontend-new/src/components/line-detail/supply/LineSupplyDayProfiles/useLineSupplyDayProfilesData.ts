'use client';

/* * */

import { useLineScopeContext } from '@/contexts/LineScope.context';
import { createDemoLineSupplyData } from '@/data/demo-performance';
import { usePlannedSupplyDayProfiles } from '@/hooks/planned-supply/usePlannedSupply';
import { useMemo } from 'react';

/* * */

export function useLineSupplyDayProfilesData() {
	//

	//
	// A. Setup variables

	const lineScope = useLineScopeContext();
	const { demoRefreshIndex, identity, lineId, periods } = lineScope.data;
	const isLiveDataEnabled = !lineScope.flags.is_demo;

	//
	// B. Fetch data

	const request = usePlannedSupplyDayProfiles({ agencyId: identity.agency_id, endDate: periods.current.endDate, lineId: identity.line_id, startDate: periods.current.startDate }, isLiveDataEnabled);

	//
	// C. Transform data

	const demoData = useMemo(
		() => lineScope.flags.is_demo ? createDemoLineSupplyData(lineId, periods, demoRefreshIndex) : undefined,
		[demoRefreshIndex, lineId, lineScope.flags.is_demo, periods],
	);

	//
	// D. Return data

	return {
		data: {
			line: lineScope.data.line,
			profiles: demoData?.dashboard.day_profiles ?? request.data?.profiles ?? [],
		},
		flags: {
			has_error: isLiveDataEnabled ? !!request.error : !demoData,
			is_loading: isLiveDataEnabled && request.isLoading,
		},
	};

	//
}
