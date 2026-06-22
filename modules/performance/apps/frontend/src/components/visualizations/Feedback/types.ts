/* * */

export interface FeedbackSummaryCardData {
	description?: number | string
	id: string
	label: string
	skeletonWidth?: string
	value?: number | string
}

export interface FeedbackChartBarData {
	id: string
	label?: string
	skeletonHeight?: string
	value?: number
}

export interface FeedbackCategoryRowData {
	id: string
	label: string
	percentage?: number
	skeletonWidth?: string
	value?: number | string
}

export interface FeedbackLineRowData {
	description?: number | string
	id: string
	metric?: number | string
	name?: number | string
	skeletonDescriptionWidth?: string
	skeletonMetricWidth?: string
	skeletonNameWidth?: string
}

export interface FeedbackTopicData {
	categories: FeedbackCategoryRowData[]
	chartBars: FeedbackChartBarData[]
	chartTitle?: string
	summaryCards: FeedbackSummaryCardData[]
	topLines: FeedbackLineRowData[]
}
