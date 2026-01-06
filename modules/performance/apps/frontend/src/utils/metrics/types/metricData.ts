/**
 * Core data interfaces for metrics system
 */

import { TFunction } from 'i18next';

/** Individual data point within a metric item */
export interface DemandDataPoint {
	/** Support for extra metric keys */
	[key: string]: number | string | undefined
	day_type?: '1' | '2' | '3'
	holiday?: '0' | '1'
	notes?: null | string
	period?: '1' | '2' | '3'
	/** Primary quantity value (optional) */
	qty?: number
}

/** Complete metric item with metadata */
export interface RawMetricData {
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
	/** Key for quantity field in data points */
	quantityKey?: string
	/** Translation function for internationalization */
	t?: TFunction
	/** Time granularity for data aggregation */
	timeView: 'annual' | 'daily' | 'monthly'
	/** Number of top items to show (rest grouped as "Others") */
	topN?: number
}

/** Configuration for pie chart (requires breakdown key) */
interface PieChartOptions extends BaseMetricTransformOptions {
	/** Key for data point breakdown (e.g., by product, category) */
	breakdownKey: string
	chartType: 'pie'
}

/** Configuration for stacked chart (requires breakdown key) */
interface StackedChartOptions extends BaseMetricTransformOptions {
	/** Key for data point breakdown (e.g., by product, category) */
	breakdownKey: string
	chartType: 'stacked'
}

/** Configuration for bar progress chart */
interface BarProgressChartOptions extends BaseMetricTransformOptions {
	/** Key for achieved value */
	achievedKey: string
	chartType: 'bar-progress'
	/** Key for total value */
	totalKey: string
}

/** Configuration for timeseries chart (breakdown key optional) */
interface TimeSeriesChartOptions extends BaseMetricTransformOptions {
	chartType: 'timeseries'
}

/** Configuration for metric transformations - discriminated union enforces breakdown key requirements */
export type MetricTransformOptions = BarProgressChartOptions | PieChartOptions | StackedChartOptions | TimeSeriesChartOptions;
