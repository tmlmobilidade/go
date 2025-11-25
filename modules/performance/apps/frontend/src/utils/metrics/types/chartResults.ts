/**
 * Chart result interfaces for different visualization types
 */

/** Data point for daily time series charts */
export interface DailyDataPoint {
	day_detailed: string
	day_short: string
	qty: number
}

/** Data point for monthly time series charts */
export interface MonthlyDataPoint {
	month: string
	qty: number
}

/** Data point for yearly time series charts */
export interface YearlyDataPoint {
	qty: number
	year: string
}

/** Result structure for time series charts (line/bar) */
export interface TimeSeriesResult {
	chart: DailyDataPoint[] | MonthlyDataPoint[] | YearlyDataPoint[]
	sum: number
}

/** Result structure for stacked charts */
export interface StackedResult {
	chart: Record<string, number | string | undefined>[]
	series: string[]
	sum: number
}

/** Result structure for progress bar charts */
export interface ProgressBarResult {
	chart: Record<string, number | string | undefined>[]
	series: string[]
	sum: number
}

/** Result structure for pie charts */
export interface PieResult {
	chart: { color: string, name: string, value: number }[]
	sum: number
}

/** Generic transform result wrapper */
export interface TransformResult<T = PieResult | ProgressBarResult | StackedResult | TimeSeriesResult> {
	all: T
	lastUpdated: Date | null
}
