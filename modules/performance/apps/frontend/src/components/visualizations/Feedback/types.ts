/* * */

export interface FeedbackSummaryCardData {
	description?: number | string
	id: string
	label: string
	value?: number | string
}

export interface FeedbackChartBarData {
	id: string
	label?: string
	value?: number
}

export interface FeedbackLineRowData {
	description?: number | string
	id: string
	metric?: number | string
	name?: number | string
	satisfactionIndex?: number
	satisfactionMetric?: number | string
}

export interface FeedbackTopicData {
	chartBars: FeedbackChartBarData[]
	chartTitle?: string
	topLines: FeedbackLineRowData[]
	topStops: FeedbackLineRowData[]
}
