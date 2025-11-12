/* * */

import { type Metric } from '@tmlmobilidade/types';

import { API_ROUTES } from '../../../../../packages/consts/dist/src/app-routes';

/* * */

// const metricEndpoint = (metric: Metric['metric']): string => `/api/metrics/${metric}`;

const metricEndpoint = (
	metric: Metric['metric'],
	queryParams?: Record<string, boolean | number | string | undefined>,
): string => {
	const base = `${API_ROUTES.performance.METRICS}/${metric}`;

	if (!queryParams || Object.keys(queryParams).length === 0) return base;

	const searchParams = new URLSearchParams();

	for (const [key, value] of Object.entries(queryParams)) {
		if (value !== undefined && value !== '') {
			searchParams.append(key, String(value));
		}
	}

	return `${base}?${searchParams.toString()}`;
};

export const MetricsRoutes = Object.freeze({
	DEMAND_BY_AGENCY_BY_DAY: metricEndpoint('demand_by_agency_by_day'),
	DEMAND_BY_AGENCY_BY_MONTH: metricEndpoint('demand_by_agency_by_month'),
	DEMAND_BY_LINE_BY_DAY: metricEndpoint('demand_by_line_by_day'),
	DEMAND_BY_PATTERN_BY_DAY: metricEndpoint('demand_by_pattern_by_day'),
	REALTIME_DEMAND: metricEndpoint('realtime_demand'),
	REALTIME_SERVICE_COMPLIANCE: metricEndpoint('realtime_service_compliance'),
	TOP_DEMAND_BY_AGENCY: metricEndpoint('top_demand_by_agency'),
	TOP_DEMAND_BY_AGENCY_BY_DAY_TYPE: metricEndpoint('top_demand_by_agency_by_day_type'),
	TOP_LINES_30DAY_PERFORMANCE: metricEndpoint('top_lines_30day_performance'),
	TOP_MEAN_DEMAND_BY_LINE_BY_MONTH: metricEndpoint('top_mean_demand_by_line_by_month'),
});

export const Routes = Object.freeze({
	CMET_API: process.env.NEXT_PUBLIC_CMET_API_URL ?? 'https://api.carrismetropolitana.pt/v2',
	LINES: '/api/lines',
	PATTERNS: '/api/patterns',
	URL: process.env.PUBLIC_URL ?? 'https://performance.sae.carrismetropolitana.pt',
	// ...PageRoutes,
	...MetricsRoutes,
});
