/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Metric } from '@tmlmobilidade/types';

/* * */

// const metricEndpoint = (metric: Metric['metric']): string => `/api/metrics/${metric}`;

const metricEndpoint = (
	metric: Metric['metric'],
	queryParams?: Record<string, boolean | number | string | undefined>,
): string => {
	const base = `${API_ROUTES.performance.METRICS_DETAIL(metric)}`;

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
	DEMAND_BY_AGENCY_BY_DAY_BY_PRODUCT: metricEndpoint('demand_by_agency_by_day_by_product'),
	DEMAND_BY_AGENCY_BY_MONTH: metricEndpoint('demand_by_agency_by_month'),
	DEMAND_BY_AGENCY_BY_YEAR: metricEndpoint('demand_by_agency_by_year'),
	DEMAND_BY_CATEGORY_BY_AGENCY_BY_DAY: metricEndpoint('demand_by_category_by_agency_by_day'),
	DEMAND_BY_CATEGORY_BY_AGENCY_BY_MONTH: metricEndpoint('demand_by_category_by_agency_by_month'),
	DEMAND_BY_CATEGORY_BY_AGENCY_BY_YEAR: metricEndpoint('demand_by_category_by_agency_by_year'),
	DEMAND_BY_CATEGORY_BY_LINE_BY_DAY: metricEndpoint('demand_by_category_by_line_by_day'),
	DEMAND_BY_CATEGORY_BY_LINE_BY_MONTH: metricEndpoint('demand_by_category_by_line_by_month'),
	DEMAND_BY_CATEGORY_BY_LINE_BY_YEAR: metricEndpoint('demand_by_category_by_line_by_year'),
	DEMAND_BY_CATEGORY_BY_PATTERN_BY_DAY: metricEndpoint('demand_by_category_by_pattern_by_day'),
	DEMAND_BY_CATEGORY_BY_PATTERN_BY_MONTH: metricEndpoint('demand_by_category_by_pattern_by_month'),
	DEMAND_BY_CATEGORY_BY_PATTERN_BY_YEAR: metricEndpoint('demand_by_category_by_pattern_by_year'),
	DEMAND_BY_LINE_BY_DAY: metricEndpoint('demand_by_line_by_day'),
	DEMAND_BY_LINE_BY_MONTH: metricEndpoint('demand_by_line_by_month'),
	DEMAND_BY_LINE_BY_YEAR: metricEndpoint('demand_by_line_by_year'),
	DEMAND_BY_PATTERN_BY_DAY: metricEndpoint('demand_by_pattern_by_day'),
	DEMAND_BY_PATTERN_BY_MONTH: metricEndpoint('demand_by_pattern_by_month'),
	DEMAND_BY_PATTERN_BY_YEAR: metricEndpoint('demand_by_pattern_by_year'),
	DEMAND_BY_PRODUCT_BY_AGENCY_BY_DAY: metricEndpoint('demand_by_product_by_agency_by_day'),
	DEMAND_BY_PRODUCT_BY_AGENCY_BY_MONTH: metricEndpoint('demand_by_product_by_agency_by_month'),
	DEMAND_BY_PRODUCT_BY_AGENCY_BY_YEAR: metricEndpoint('demand_by_product_by_agency_by_year'),
	DEMAND_BY_PRODUCT_BY_LINE_BY_DAY: metricEndpoint('demand_by_product_by_line_by_day'),
	DEMAND_BY_PRODUCT_BY_LINE_BY_MONTH: metricEndpoint('demand_by_product_by_line_by_month'),
	DEMAND_BY_PRODUCT_BY_LINE_BY_YEAR: metricEndpoint('demand_by_product_by_line_by_year'),
	DEMAND_BY_PRODUCT_BY_PATTERN_BY_DAY: metricEndpoint('demand_by_product_by_pattern_by_day'),
	DEMAND_BY_PRODUCT_BY_PATTERN_BY_MONTH: metricEndpoint('demand_by_product_by_pattern_by_month'),
	DEMAND_BY_PRODUCT_BY_PATTERN_BY_YEAR: metricEndpoint('demand_by_product_by_pattern_by_year'),
	REALTIME_DEMAND: metricEndpoint('realtime_demand'),
	REALTIME_SERVICE_COMPLIANCE: metricEndpoint('realtime_service_compliance'),
	SUPPLY_BY_AGENCY_BY_DAY: metricEndpoint('supply_by_agency_by_day'),
	SUPPLY_BY_AGENCY_BY_MONTH: metricEndpoint('supply_by_agency_by_month'),
	SUPPLY_BY_AGENCY_BY_YEAR: metricEndpoint('supply_by_agency_by_year'),
	TOP_DEMAND_BY_AGENCY: metricEndpoint('top_demand_by_agency'),
	TOP_DEMAND_BY_AGENCY_BY_DAY_TYPE: metricEndpoint('top_demand_by_agency_by_day_type'),
	TOP_LINES_30DAY_PERFORMANCE: metricEndpoint('top_lines_30day_performance'),
	TOP_MEAN_DEMAND_BY_LINE_BY_MONTH: metricEndpoint('top_mean_demand_by_line_by_month'),
});

const GO_HUB_API = 'https://go.tmlmobilidade.pt/hub/api/v1';

export const Routes = Object.freeze({
	FEEDBACK_PREVIEW: `${API_ROUTES.performance.BASE}/feedback/preview`,
	HUB_LINES: `${GO_HUB_API}/network/lines`,
	HUB_STOPS: `${GO_HUB_API}/network/stops`,
	LINES: '/api/lines',
	PATTERNS: '/api/patterns',
	URL: process.env.PUBLIC_URL ?? 'https://performance.sae.carrismetropolitana.pt',
	// ...PageRoutes,
	...MetricsRoutes,
});
