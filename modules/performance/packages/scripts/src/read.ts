import { METRICS } from './catalog.js';
import { initializeStorage, type MetricRow, querySql, snapshot } from './storage.js';

export interface PerformanceMetric {
	_id: string
	created_at: number
	data: Record<string, unknown>
	description: string
	generated_at: Date
	metric: string
	properties?: Record<string, number | string>
	updated_at: number
}

function set(object: Record<string, unknown>, key: string, value: unknown) {
	Object.defineProperty(object, key, { configurable: true, enumerable: true, value, writable: true });
}

function record(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Formatting only: all quantities, totals, means, rankings, and comparisons are SQL results. */
export function formatMetrics(rows: MetricRow[]): PerformanceMetric[] {
	const docs = new Map<string, PerformanceMetric>();
	for (const row of rows) {
		const properties = Object.fromEntries(Object.entries(row.properties).sort(([a], [b]) => a.localeCompare(b)));
		const id = `${row.metric}:${JSON.stringify(properties)}`;
		let doc = docs.get(id);
		if (!doc) {
			doc = {
				_id: id,
				created_at: row.generated_at,
				data: {},
				description: row.metric,
				generated_at: new Date(row.generated_at),
				metric: row.metric,
				updated_at: row.generated_at,
			};
			if (Object.keys(properties).length) doc.properties = Object.fromEntries(Object.entries(properties).map(([key, value]) => [key, key === 'hour' || key === 'minute' ? Number(value) : value]));
			docs.set(id, doc);
		}
		doc.generated_at = new Date(Math.max(doc.generated_at.getTime(), row.generated_at));
		doc.updated_at = doc.generated_at.getTime();
		let target = doc.data;
		for (const [index, key] of row.path.entries()) {
			if (index === row.path.length - 1 && row.scalar !== null) {
				set(target, key, row.scalar);
				break;
			}
			let child: unknown = Object.getOwnPropertyDescriptor(target, key)?.value;
			if (!record(child)) {
				child = {};
				set(target, key, child);
			}
			if (!record(child)) throw new Error('Invalid metric path');
			target = child;
		}
		if (row.scalar === null) {
			for (const values of [row.numbers, row.strings, row.booleans]) {
				for (const [key, value] of Object.entries(values)) set(target, key, value);
			}
		}
	}
	return [...docs.values()];
}

function ids(value: unknown): string[] {
	if (value === undefined) return [];
	if (typeof value === 'string') return value.split(',').map(id => id.trim());
	if (Array.isArray(value) && value.every(id => typeof id === 'string')) return value;
	throw new Error('Invalid metric dimension filter');
}

export function filterMetricDates(data: Record<string, unknown>, start?: string, end?: string) {
	const reference = start || end;
	if (!reference) return data;
	const length = /^\d{4}$/.test(reference) ? 4 : /^\d{4}-\d{2}$/.test(reference) ? 7 : 10;
	return Object.fromEntries(Object.entries(data).filter(([date]) => {
		const normalized = date.split('T')[0].slice(0, length);
		return (!start || normalized >= start.slice(0, length)) && (!end || normalized <= end.slice(0, length));
	}));
}

export async function readMetrics(metric: string, filters: Record<string, unknown> = {}) {
	if (!METRICS.some(entry => entry.id === metric)) return [];
	await initializeStorage();
	const runs = await snapshot([metric]);
	if (!runs.length) return [];
	const rows = await querySql<MetricRow>('storage/read.sql', {
		input_runs: runs,
		line_ids: ids(filters.line_ids),
		metric,
		pattern_ids: ids(filters.pattern_ids),
	});
	const docs = formatMetrics(rows);
	if (!filters.start_date && !filters.end_date) return docs;
	const start = typeof filters.start_date === 'string' ? filters.start_date : undefined;
	const end = typeof filters.end_date === 'string' ? filters.end_date : undefined;
	return docs.map(doc => ({ ...doc, data: filterMetricDates(doc.data, start, end) })).filter(doc => Object.keys(doc.data).length > 0);
}

export async function readNetwork(dimension: 'line_id' | 'pattern_id') {
	await initializeStorage();
	const inputRuns = await snapshot(METRICS.map(metric => metric.id));
	const rows = await querySql<{ id: string }>('storage/network.sql', { dimension, input_runs: inputRuns });
	return rows.map(row => row.id);
}

export async function readCalendar() {
	await initializeStorage();
	return querySql<Record<string, unknown>>('storage/calendar.sql', { input_runs: await snapshot(['__calendar']) });
}
