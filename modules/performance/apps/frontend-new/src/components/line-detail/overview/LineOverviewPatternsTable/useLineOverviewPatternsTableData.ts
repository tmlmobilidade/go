'use client';

/* * */

import { type LineOverviewPatternTableRow } from '@/components/line-detail/overview/LineOverviewPatternsTable/types';
import { useLineScopeContext } from '@/contexts/LineScope.context';
import { createDemoLineDetailData } from '@/data/demo-performance';
import { usePassengerDemandBreakdown } from '@/hooks/passenger-demand/usePassengerDemandBreakdown';
import { getPatternMetricValueByCode } from '@/utils/pattern-metrics';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type RidePerformanceByPatternItem } from '@tmlmobilidade/go-types-performance';
import { type CsvExportRow } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

export function useLineOverviewPatternsTableData() {
	//

	//
	// A. Setup variables

	const lineScope = useLineScopeContext();
	const { demoRefreshIndex, identity, lineId, periods } = lineScope.data;
	const patterns = lineScope.data.line?.patterns ?? [];
	const isLiveDataEnabled = !lineScope.flags.is_demo && patterns.length > 0;
	const operationalQuery = new URLSearchParams({
		agency_id: identity.agency_id,
		end_date: periods.current.endDate,
		exclude_unknown: 'true',
		limit: '1000',
		line_id: identity.line_id,
		start_date: periods.current.startDate,
	});

	//
	// B. Fetch data

	const demandRequest = usePassengerDemandBreakdown({
		dimension: 'pattern',
		enabled: isLiveDataEnabled,
		filters: { agencyId: identity.agency_id, endDate: periods.current.endDate, excludeUnknown: true, lineId: identity.line_id, startDate: periods.current.startDate },
		limit: 1000,
	});
	const operationalRequest = useSWR<RidePerformanceByPatternItem[], Error>(
		isLiveDataEnabled ? `${API_ROUTES.performance.RIDE_PERFORMANCE_BY_PATTERN}?${operationalQuery.toString()}` : null,
	);

	//
	// C. Transform data

	const demoData = useMemo(
		() => lineScope.flags.is_demo ? createDemoLineDetailData(lineId, periods, demoRefreshIndex) : undefined,
		[demoRefreshIndex, lineId, lineScope.flags.is_demo, periods],
	);
	const demandByPatternCode = useMemo(
		() => demoData?.demandByPatternCode ?? new Map(demandRequest.data?.items.map(item => [item.id, item.passenger_demand]) ?? []),
		[demandRequest.data, demoData?.demandByPatternCode],
	);
	const operationalByPatternCode = useMemo(
		() => demoData?.operationalByPatternCode ?? new Map(operationalRequest.data?.map(item => [item.pattern_id, item]) ?? []),
		[demoData?.operationalByPatternCode, operationalRequest.data],
	);
	const rows = useMemo<LineOverviewPatternTableRow[]>(() => patterns.map(pattern => ({
		advances: operationalByPatternCode.get(pattern.code)?.advances_pct ?? null,
		code: pattern.code,
		delays: operationalByPatternCode.get(pattern.code)?.delays_pct ?? null,
		id: pattern._id,
		label: pattern.headsign || `${pattern.origin} → ${pattern.destination}`,
		service: operationalByPatternCode.get(pattern.code)?.service_pct ?? null,
		validations: getPatternMetricValueByCode(demandByPatternCode, pattern),
	})), [demandByPatternCode, operationalByPatternCode, patterns]);
	const exportRows = useMemo<CsvExportRow[]>(() => patterns.map((pattern) => {
		const operational = operationalByPatternCode.get(pattern.code);
		return {
			advanced_rides_qty: operational?.advanced_rides_qty,
			advances_pct: operational?.advances_pct,
			coverage_pct: operational?.coverage_pct,
			delay_eligible_rides_qty: operational?.delay_eligible_rides_qty,
			delayed_rides_qty: operational?.delayed_rides_qty,
			delays_pct: operational?.delays_pct,
			execution_failure_rides_qty: operational?.execution_failure_rides_qty,
			observed_start_rides_qty: operational?.observed_start_rides_qty,
			passenger_demand: getPatternMetricValueByCode(demandByPatternCode, pattern),
			pattern_code: pattern.code,
			pattern_destination: pattern.destination,
			pattern_headsign: pattern.headsign,
			pattern_id: pattern._id,
			pattern_origin: pattern.origin,
			scheduled_rides_qty: operational?.scheduled_rides_qty,
			service_pct: operational?.service_pct,
		};
	}), [demandByPatternCode, operationalByPatternCode, patterns]);

	//
	// D. Return data

	return {
		data: { exportRows, line: lineScope.data.line, patterns, rows },
		flags: {
			has_demand_error: isLiveDataEnabled && !!demandRequest.error,
			has_operational_error: isLiveDataEnabled && !!operationalRequest.error,
			is_loading: isLiveDataEnabled && (demandRequest.isLoading || operationalRequest.isLoading),
		},
	};

	//
}
