'use client';

/* * */

import { createDemandHeatmapCells } from '@/components/line-detail/demand/LineDemandHeatmap/metrics';
import { useLineScopeContext } from '@/contexts/LineScope.context';
import { createDemoLineDetailData } from '@/data/demo-performance';
import { usePassengerDemandSeries } from '@/hooks/passenger-demand/usePassengerDemandSeries';
import { useMemo } from 'react';

/* * */

export function useLineDemandHeatmapData() {
	//

	//
	// A. Setup variables

	const lineScope = useLineScopeContext();
	const { demoRefreshIndex, identity, lineId, periods } = lineScope.data;
	const isLiveDataEnabled = !lineScope.flags.is_demo;
	const request = usePassengerDemandSeries({
		enabled: isLiveDataEnabled,
		filters: { agencyId: identity.agency_id, endDate: periods.current.endDate, excludeUnknown: true, lineId: identity.line_id, startDate: periods.current.startDate },
		grain: 'hour',
	});

	//
	// C. Transform data

	const demoData = useMemo(
		() => lineScope.flags.is_demo ? createDemoLineDetailData(lineId, periods, demoRefreshIndex) : undefined,
		[demoRefreshIndex, lineId, lineScope.flags.is_demo, periods],
	);
	const points = demoData?.hourlyDemandPoints ?? request.data?.points ?? [];
	const cells = useMemo(() => createDemandHeatmapCells(points), [points]);

	//
	// D. Return data

	return {
		data: { cells, line: lineScope.data.line, points },
		flags: {
			has_error: isLiveDataEnabled && !!request.error,
			is_loading: isLiveDataEnabled && request.isLoading,
		},
	};

	//
}
