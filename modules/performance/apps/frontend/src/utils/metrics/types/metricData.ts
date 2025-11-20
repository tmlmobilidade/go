/**
 * Core data interfaces for metrics system
 */

import { useTranslations } from 'next-intl';

/** Individual data point within a metric item */
export interface DemandDataPoint {
	day_type?: '1' | '2' | '3'
	holiday?: '0' | '1'
	notes?: null | string
	period?: '1' | '2' | '3'
	/** Primary quantity value */
	qty: number
}

/** Complete metric item with metadata */
export interface DemandMetricItem {
	/** Date-indexed data points (YYYY-MM-DD, YYYY-MM, or YYYY) */
	data: Record<string, DemandDataPoint>
	/** ISO timestamp of when this metric was generated */
	generated_at: string
	/** Additional properties (product_id, category, line_id, etc.) */
	properties?: Record<string, string>
}

/** Base configuration shared by all chart types */
interface BaseMetricTransformOptions {
	/** Filter by specific agency IDs (client-side filtering) */
	agencyIds?: string[]
	/** Translation function for internationalization */
	t?: ReturnType<typeof useTranslations>
	/** Time granularity for data aggregation */
	timeView: 'annual' | 'daily' | 'monthly'
	/** Number of top items to show (rest grouped as "Others") */
	topN?: number
}

/** Configuration for pie chart (requires breakdown key) */
interface PieChartOptions extends BaseMetricTransformOptions {
	breakdownKey: string
	chartType: 'pie'
}

/** Configuration for stacked chart (requires breakdown key) */
interface StackedChartOptions extends BaseMetricTransformOptions {
	breakdownKey: string
	chartType: 'stacked'
}

/** Configuration for timeseries chart (breakdown key optional) */
interface TimeSeriesChartOptions extends BaseMetricTransformOptions {
	chartType: 'timeseries'
}

/** Configuration for metric transformations - discriminated union enforces breakdown key requirements */
export type MetricTransformOptions = PieChartOptions | StackedChartOptions | TimeSeriesChartOptions;
