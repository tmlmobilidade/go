import { MetricsRoutes } from '@/routes';

/* * */

export interface MetricConfiguration {
	/** What to group by: agency, line, pattern */
	groupBy: 'agency' | 'line' | 'pattern'
	/** Primary metric type */
	metricType: 'demand' | 'demand-by-category' | 'demand-by-product' | 'supply'
	/** Time granularity */
	timeView: 'annual' | 'daily' | 'monthly'
}

export interface MetricFilters {
	agencyIds?: string[]
	endDate?: Date | string
	lineIds?: string[]
	patternIds?: string[]
	startDate?: Date | string
}

/* * */

/**
 * Get the base API endpoint for a metric configuration
 */
function getBaseUrl(config: MetricConfiguration, filters: MetricFilters): string {
	// Determine the most efficient groupBy based on available filters
	let effectiveGroupBy = config.groupBy;

	// Use agency-level endpoint as default for efficiency unless specific IDs are provided
	if (config.groupBy === 'line' && !filters.lineIds?.length) {
		effectiveGroupBy = 'agency';
	}
	if (config.groupBy === 'pattern' && !filters.patternIds?.length) {
		effectiveGroupBy = 'agency';
	}

	// Build route key dynamically: "DEMAND_BY_AGENCY_BY_DAY"
	const parts = [
		config.metricType.toUpperCase().replace(/-/g, '_'),
		'BY',
		effectiveGroupBy.toUpperCase(),
		'BY',
		config.timeView === 'daily' ? 'DAY' : config.timeView === 'monthly' ? 'MONTH' : 'YEAR',
	];

	const routeKey = parts.join('_') as keyof typeof MetricsRoutes;
	const url = MetricsRoutes[routeKey];

	if (!url) {
		throw new Error(`Unsupported metric: ${routeKey}`);
	}

	return url;
}

/**
 * Format dates according to timeView for smart API filtering
 */
function formatDateForTimeView(date: Date | string, view: 'annual' | 'daily' | 'monthly'): string {
	if (typeof date === 'string') return date;

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	switch (view) {
		case 'annual': return String(year);
		case 'daily': return `${year}-${month}-${day}`;
		case 'monthly': return `${year}-${month}`;
	}
}

/**
 * Build query parameters based on filters
 */
function buildQueryParams(config: MetricConfiguration, filters: MetricFilters): string {
	const params = new URLSearchParams();

	// Use specific line IDs when provided
	if (filters.lineIds?.length && config.groupBy === 'line') {
		params.set('line_ids', filters.lineIds.join(','));
	}

	// Use specific pattern IDs when provided
	if (filters.patternIds?.length && config.groupBy === 'pattern') {
		params.set('pattern_ids', filters.patternIds.join(','));
	}

	// Add date filters
	if (filters.startDate) {
		params.set('start_date', formatDateForTimeView(filters.startDate, config.timeView));
	}
	if (filters.endDate) {
		params.set('end_date', formatDateForTimeView(filters.endDate, config.timeView));
	}

	return params.toString();
}

/**
 * Build the complete metric URL with query parameters
 */
export function buildMetricUrl(config: MetricConfiguration, filters: MetricFilters = {}): string {
	const baseUrl = getBaseUrl(config, filters);
	const params = buildQueryParams(config, filters);
	return params ? `${baseUrl}?${params}` : baseUrl;
}

/**
 * Format dates according to timeView
 */
export { formatDateForTimeView };
