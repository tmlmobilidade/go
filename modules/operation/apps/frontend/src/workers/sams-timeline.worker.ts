import { DateTime } from 'luxon';

const LISBON_ZONE = 'Europe/Lisbon';

interface SamAnalysisLite {
	end_time: null | number
	first_transaction_id: null | string
	last_transaction_id: null | string
	start_time: null | number
}

interface SamAnalysisListItem {
	_id: number
	analysis: SamAnalysisLite[]
}

interface TimelineMonthCounters {
	failed: number
	successful: number
}

interface SamTimelineSummaryLite {
	months: Array<{
		failed_count: number
		month: string
		successful_count: number
	}>
}

interface WorkerAggregateRequest {
	items: SamAnalysisListItem[]
	jobId: number
	type: 'aggregate'
}

interface WorkerAggregateResponse {
	items: Array<{
		_id: number
		timeline_summary: SamTimelineSummaryLite
	}>
	jobId: number
	type: 'aggregated'
}

function analysisMonthKeys(analysis: SamAnalysisLite): string[] {
	if (analysis.start_time == null && analysis.end_time == null) return [];

	const startTs = toMillis(analysis.start_time ?? analysis.end_time);
	const endTs = toMillis(analysis.end_time ?? analysis.start_time);
	if (startTs == null || endTs == null) return [];

	const first = DateTime.fromMillis(Math.min(startTs, endTs), { zone: LISBON_ZONE }).startOf('month');
	const last = DateTime.fromMillis(Math.max(startTs, endTs), { zone: LISBON_ZONE }).startOf('month');
	if (!first.isValid || !last.isValid) return [];

	const keys: string[] = [];
	for (let cursor = first; cursor <= last; cursor = cursor.plus({ months: 1 }))
		keys.push(cursor.toFormat('yyyy-LL'));
	return keys;
}

function toMillis(value: unknown): null | number {
	if (typeof value === 'number' && Number.isFinite(value))
		return Math.trunc(value);
	if (value != null && typeof value === 'object' && 'toNumber' in value && typeof (value as { toNumber: () => unknown }).toNumber === 'function') {
		const numeric = Number((value as { toNumber: () => unknown }).toNumber());
		if (Number.isFinite(numeric))
			return Math.trunc(numeric);
	}
	const numeric = Number(value);
	if (Number.isFinite(numeric))
		return Math.trunc(numeric);
	return null;
}

function timelineSummaryFromAnalysis(analyses: SamAnalysisLite[]): SamTimelineSummaryLite {
	const monthCounters = new Map<string, TimelineMonthCounters>();

	for (const analysis of analyses ?? []) {
		const isSuccessful = analysis.first_transaction_id != null && analysis.last_transaction_id != null;
		const monthKeys = analysisMonthKeys(analysis);

		for (const monthKey of monthKeys) {
			const counters = monthCounters.get(monthKey) ?? { failed: 0, successful: 0 };
			if (isSuccessful) counters.successful++;
			else counters.failed++;
			monthCounters.set(monthKey, counters);
		}
	}

	const months = [...monthCounters.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, counters]) => ({
			failed_count: counters.failed,
			month: key,
			successful_count: counters.successful,
		}));

	return { months };
}

self.onmessage = (event: MessageEvent<WorkerAggregateRequest>) => {
	if (event.data.type !== 'aggregate') return;

	const items = event.data.items.map(item => ({
		_id: item._id,
		timeline_summary: timelineSummaryFromAnalysis(item.analysis ?? []),
	}));

	const response: WorkerAggregateResponse = {
		items,
		jobId: event.data.jobId,
		type: 'aggregated',
	};

	self.postMessage(response);
};

export { };
