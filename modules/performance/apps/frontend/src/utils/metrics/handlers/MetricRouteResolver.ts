import { MetricsRoutes } from '@/routes';

/* * */

export interface MetricConfiguration {
	/** Additional breakdowns */
	breakdowns?: ('product')[]
	/** What to group by: agency, line, pattern, product */
	groupBy: 'agency' | 'line' | 'pattern' | 'product'
	/** Primary metric type */
	metricType: 'demand'
	/** Time granularity */
	timeView: 'annual' | 'daily' | 'monthly'
}

export interface MetricFilters {
	agencyId?: string | string[]
	lineIds?: string[]
	patternIds?: string[]
	productIds?: string[]
}

/* * */

const METRIC_PATTERNS = {
	// Basic demand metrics (no product breakdown)
	'demand': {
		agency: {
			annual: MetricsRoutes.DEMAND_BY_AGENCY_BY_YEAR,
			daily: MetricsRoutes.DEMAND_BY_AGENCY_BY_DAY,
			monthly: MetricsRoutes.DEMAND_BY_AGENCY_BY_MONTH,
		},
		line: {
			annual: MetricsRoutes.DEMAND_BY_LINE_BY_YEAR,
			daily: MetricsRoutes.DEMAND_BY_LINE_BY_DAY,
			monthly: MetricsRoutes.DEMAND_BY_LINE_BY_MONTH,
		},
		pattern: {
			annual: MetricsRoutes.DEMAND_BY_PATTERN_BY_YEAR,
			daily: MetricsRoutes.DEMAND_BY_PATTERN_BY_DAY,
			monthly: MetricsRoutes.DEMAND_BY_PATTERN_BY_MONTH,
		},
	},
	// Product-broken-down demand metrics
	'demand-by-product': {
		agency: {
			annual: MetricsRoutes.DEMAND_BY_PRODUCT_BY_AGENCY_BY_YEAR,
			daily: MetricsRoutes.DEMAND_BY_PRODUCT_BY_AGENCY_BY_DAY,
			monthly: MetricsRoutes.DEMAND_BY_PRODUCT_BY_AGENCY_BY_MONTH,
		},
		line: {
			annual: MetricsRoutes.DEMAND_BY_PRODUCT_BY_LINE_BY_YEAR,
			daily: MetricsRoutes.DEMAND_BY_PRODUCT_BY_LINE_BY_DAY,
			monthly: MetricsRoutes.DEMAND_BY_PRODUCT_BY_LINE_BY_MONTH,
		},
		// Note: Product by pattern metrics don't exist yet
	},
} as const;

/**
 * Get the base API endpoint for a metric configuration
 */
function getBaseUrl(config: MetricConfiguration): string {
	const hasProductBreakdown = config.breakdowns?.includes('product');

	// Determine which metric pattern to use
	const metricKey = hasProductBreakdown ? 'demand-by-product' : 'demand';
	const metricPattern = METRIC_PATTERNS[metricKey];

	if (!metricPattern) {
		throw new Error(`Unsupported metric type: ${config.metricType}`);
	}

	const groupPattern = metricPattern[config.groupBy];
	if (!groupPattern) {
		throw new Error(`Unsupported groupBy for ${metricKey}: ${config.groupBy}`);
	}

	const url = groupPattern[config.timeView];
	if (!url) {
		throw new Error(`Unsupported timeView for ${metricKey}-${config.groupBy}: ${config.timeView}`);
	}

	return url;
}

/**
 * Build query parameters based on filters
 */
function buildQueryParams(config: MetricConfiguration, filters: MetricFilters): string {
	const params = new URLSearchParams();

	// Add filters based on groupBy type
	if (config.groupBy === 'line' && filters.lineIds?.length) {
		params.set('line_ids', filters.lineIds.join(','));
	}
	else if (config.groupBy === 'pattern' && filters.patternIds?.length) {
		params.set('pattern_ids', filters.patternIds.join(','));
	}
	else if (config.groupBy === 'agency' && filters.agencyId && filters.agencyId !== 'all') {
		const agencyIds = Array.isArray(filters.agencyId) ? filters.agencyId : [filters.agencyId];
		params.set('agency_ids', agencyIds.join(','));
	}

	// Add product filters if applicable
	if (config.breakdowns?.includes('product') && filters.productIds?.length) {
		params.set('product_ids', filters.productIds.join(','));
	}

	return params.toString();
}

/**
 * Check if a metric configuration is supported
 */
function isSupported(config: MetricConfiguration): boolean {
	try {
		getBaseUrl(config);
		return true;
	}
	catch {
		return false;
	}
}

/**
 * Resolver for building metric API URLs based on dimensions and filters
 */
export const MetricRouteResolver = {
	/**
	 * Build the complete metric URL with query parameters
	 */
	buildMetricUrl(config: MetricConfiguration, filters: MetricFilters = {}): string {
		const baseUrl = getBaseUrl(config);
		const params = buildQueryParams(config, filters);

		return params ? `${baseUrl}?${params}` : baseUrl;
	},

	/**
	 * Build optimized metric URL - automatically chooses the most efficient API endpoint
	 */
	buildOptimizedMetricUrl(config: MetricConfiguration, filters: MetricFilters = {}): string {
		const optimalConfig = this.getOptimalConfig(config, filters);
		return this.buildMetricUrl(optimalConfig, filters);
	},

	/**
	 * Get the base API endpoint for a metric configuration
	 */
	getBaseUrl,

	/**
	 * Determine optimal metric route based on applied filters
	 * This helps optimize API calls by choosing the most specific metric available
	 */
	getOptimalConfig(
		baseConfig: MetricConfiguration,
		filters: MetricFilters,
	): MetricConfiguration {
		// Check if we actually need the specific groupBy level
		const hasLineFilters = baseConfig.groupBy === 'line' && filters.lineIds?.length;
		const hasPatternFilters = baseConfig.groupBy === 'pattern' && filters.patternIds?.length;
		const hasAgencyFilters = baseConfig.groupBy === 'agency' && filters.agencyId && filters.agencyId !== 'all';

		// If requesting line or pattern data but no specific filters are applied,
		// we can optimize by using agency-level metrics (much smaller payload, same aggregated data)
		if ((baseConfig.groupBy === 'line' || baseConfig.groupBy === 'pattern') && !hasLineFilters && !hasPatternFilters) {
			return {
				...baseConfig,
				groupBy: 'agency',
			};
		}

		// If requesting agency data but filtering by specific agencies, keep agency groupBy
		if (baseConfig.groupBy === 'agency' && hasAgencyFilters) {
			return baseConfig;
		}

		// Otherwise, keep the original configuration
		return baseConfig;
	},

	/**
	 * Get all supported configurations for a given metric type
	 */
	getSupportedConfigurations(metricType: 'demand'): MetricConfiguration[] {
		const configs: MetricConfiguration[] = [];

		// Basic demand metrics
		(['agency', 'line', 'pattern'] as const).forEach((groupBy) => {
			(['daily', 'monthly', 'annual'] as const).forEach((timeView) => {
				configs.push({
					groupBy,
					metricType,
					timeView,
				});
			});
		});

		// Product breakdown demand metrics
		(['agency', 'line'] as const).forEach((groupBy) => {
			(['daily', 'monthly', 'annual'] as const).forEach((timeView) => {
				configs.push({
					breakdowns: ['product'],
					groupBy,
					metricType,
					timeView,
				});
			});
		});

		// Filter only supported configurations
		return configs.filter(config => isSupported(config));
	},

	/**
	 * Check if a metric configuration is supported
	 */
	isSupported,
};
