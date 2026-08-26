'use client';

/* * */

import { createDemoLineDemandDashboardData } from '@/data/demo-performance';
import { useLineDemandSeries } from '@/hooks/useLineDemandSeries';
import { useLineDetailScope } from '@/hooks/useLineDetailScope';
import { formatPeriodRangeLabel } from '@/utils/performance-period-labels';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PassengerDemandLineDashboard, type PassengerDemandOverTimePoint } from '@tmlmobilidade/go-types-performance';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

function getRecordStartDate(endDate: string) {
	const date = new Date(`${endDate}T12:00:00Z`);
	date.setUTCFullYear(date.getUTCFullYear() - 1);
	return date.toISOString().slice(0, 10);
}

function sumDemand(points: PassengerDemandOverTimePoint[]) {
	return points.reduce((total, point) => total + point.passenger_demand, 0);
}

/* * */

export function useLineDemandData(lineId: string) {
	//

	//
	// A. Setup variables

	const lineScope = useLineDetailScope(lineId);
	const { demoRefreshIndex, identity, locale, periods } = lineScope.data;
	const isLiveDataEnabled = !lineScope.flags.is_demo;
	const demandSeries = useLineDemandSeries({
		agencyId: identity.agency_id,
		isEnabled: isLiveDataEnabled,
		lineId: identity.line_id,
		periods,
	});
	const dashboardQuery = new URLSearchParams({
		agency_id: identity.agency_id,
		comparison_end_date: periods.comparison.endDate,
		comparison_start_date: periods.comparison.startDate,
		current_end_date: periods.current.endDate,
		current_start_date: periods.current.startDate,
		line_id: identity.line_id,
		record_end_date: periods.current.endDate,
		record_start_date: getRecordStartDate(periods.current.endDate),
	});

	//
	// B. Fetch data

	const dashboardRequest = useSWR<PassengerDemandLineDashboard, Error>(
		isLiveDataEnabled
			? `${API_ROUTES.performance.PASSENGER_DEMAND_LINE_DASHBOARD}?${dashboardQuery.toString()}`
			: null,
	);

	//
	// C. Transform data

	const demoData = useMemo(
		() => lineScope.flags.is_demo ? createDemoLineDemandDashboardData(lineId, periods, demoRefreshIndex) : undefined,
		[demoRefreshIndex, lineId, lineScope.flags.is_demo, periods],
	);
	const currentPoints = demoData?.points ?? demandSeries.data.currentPoints;
	const comparisonPoints = demoData?.comparisonPoints ?? demandSeries.data.comparisonPoints;
	const hourlyPoints = demoData?.hourlyDemandPoints ?? demandSeries.data.hourlyPoints;
	const currentTotal = useMemo(() => sumDemand(currentPoints), [currentPoints]);
	const comparisonTotal = useMemo(() => sumDemand(comparisonPoints), [comparisonPoints]);
	const differencePct = comparisonTotal ? (currentTotal - comparisonTotal) / comparisonTotal * 100 : null;
	const busiestPoint = currentPoints.reduce<PassengerDemandOverTimePoint | undefined>((result, point) => (
		!result || point.passenger_demand > result.passenger_demand ? point : result
	), undefined);
	const demandByHour = new Map<number, number>();
	for (const point of hourlyPoints) {
		const hour = new Date(point.period).toLocaleString('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Europe/Lisbon' });
		const parsedHour = Number(hour);
		demandByHour.set(parsedHour, (demandByHour.get(parsedHour) ?? 0) + point.passenger_demand);
	}
	const peakHour = [...demandByHour.entries()].sort((a, b) => b[1] - a[1])[0];

	//
	// D. Return data

	return {
		data: {
			busiestPoint,
			comparisonLabel: formatPeriodRangeLabel(periods.comparison, locale),
			comparisonPoints,
			comparisonTotal,
			currentPoints,
			currentTotal,
			dashboard: demoData?.dashboard ?? dashboardRequest.data,
			differencePct,
			hourlyPoints,
			line: demoData?.line ?? lineScope.data.line,
			peakHour: peakHour ? { hour: peakHour[0], passenger_demand: peakHour[1] } : undefined,
			periods,
		},
		flags: {
			has_dashboard_error: isLiveDataEnabled && !!dashboardRequest.error,
			has_demand_error: isLiveDataEnabled && demandSeries.flags.has_error,
			has_line_error: lineScope.flags.is_demo ? !demoData : lineScope.flags.has_line_error,
			is_dashboard_loading: isLiveDataEnabled && dashboardRequest.isLoading,
			is_demand_loading: isLiveDataEnabled && demandSeries.flags.is_loading,
			is_line_loading: lineScope.flags.is_line_loading,
		},
	};

	//
}
