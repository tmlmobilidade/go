'use client';

/* * */

import { useLineScopeContext } from '@/contexts/LineScope.context';
import { createDemoLineDemandDashboardData } from '@/data/demo-performance';
import { usePassengerDemandRecords } from '@/hooks/passenger-demand/usePassengerDemandRecords';
import { useMemo } from 'react';

/* * */

function getRecordStartDate(endDate: string) {
	const date = new Date(`${endDate}T12:00:00Z`);
	date.setUTCFullYear(date.getUTCFullYear() - 1);
	return date.toISOString().slice(0, 10);
}

/* * */

export function useLineDemandRecordsData() {
	//

	//
	// A. Setup variables

	const lineScope = useLineScopeContext();
	const { demoRefreshIndex, identity, lineId, periods } = lineScope.data;
	const isLiveDataEnabled = !lineScope.flags.is_demo;
	const recordStartDate = getRecordStartDate(periods.current.endDate);

	//
	// B. Fetch data

	const request = usePassengerDemandRecords({ agencyId: identity.agency_id, endDate: periods.current.endDate, lineId: identity.line_id, startDate: recordStartDate }, isLiveDataEnabled);

	//
	// C. Transform data

	const demoData = useMemo(
		() => lineScope.flags.is_demo ? createDemoLineDemandDashboardData(lineId, periods, demoRefreshIndex) : undefined,
		[demoRefreshIndex, lineId, lineScope.flags.is_demo, periods],
	);

	//
	// D. Return data

	return {
		data: { line: lineScope.data.line, records: demoData?.dashboard.records ?? request.data?.records ?? [] },
		flags: { has_error: isLiveDataEnabled && !!request.error, is_loading: isLiveDataEnabled && request.isLoading },
	};

	//
}
