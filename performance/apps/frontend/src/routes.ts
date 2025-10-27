/* * */

import { type Metric } from '@tmlmobilidade/types';

/* * */

const metricEndpoint = (metric: Metric['metric']): string => `/api/metrics/${metric}`;

export const MetricsRoutes = Object.freeze({
	DEMAND_BY_AGENCY_BY_DAY: metricEndpoint('demand_by_agency_by_day'),
	REALTIME_DELAYS: metricEndpoint('realtime_delays'),
	REALTIME_DEMAND: metricEndpoint('realtime_demand'),
	REALTIME_SERVICE_COMPLIANCE: metricEndpoint('realtime_service_compliance'),
	TOP_DEMAND_BY_AGENCY: metricEndpoint('top_demand_by_agency'),
});

export const Routes = Object.freeze({
	URL: process.env.PUBLIC_URL ?? 'https://performance.sae.carrismetropolitana.pt',
	// ...PageRoutes,
	...MetricsRoutes,
});
