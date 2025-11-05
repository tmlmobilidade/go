/* * */

import { type Metric } from '@go/types';

/* * */

const metricEndpoint = (metric: Metric['metric']): string => `/api/metrics/${metric}`;

export const MetricsRoutes = Object.freeze({
	DEMAND_BY_AGENCY_BY_DAY: metricEndpoint('demand_by_agency_by_day'),
	DEMAND_BY_AGENCY_BY_MONTH: metricEndpoint('demand_by_agency_by_month'),
	DEMAND_BY_LINE_BY_DAY: metricEndpoint('demand_by_line_by_day'),
	REALTIME_DEMAND: metricEndpoint('realtime_demand'),
	REALTIME_SERVICE_COMPLIANCE: metricEndpoint('realtime_service_compliance'),
	TOP_DEMAND_BY_AGENCY: metricEndpoint('top_demand_by_agency'),
	TOP_MEAN_DEMAND_BY_LINE_BY_MONTH: metricEndpoint('top_mean_demand_by_line_by_month'),
});

export const Routes = Object.freeze({
	CMET_API: process.env.NEXT_PUBLIC_CMET_API_URL ?? 'https://api.carrismetropolitana.pt/v2',
	URL: process.env.PUBLIC_URL ?? 'https://performance.sae.carrismetropolitana.pt',
	// ...PageRoutes,
	...MetricsRoutes,
});
