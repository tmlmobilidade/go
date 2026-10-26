import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import { randomUUID } from 'node:crypto';

import { type Cadence, METRICS } from './catalog.js';
import { publish } from './publish.js';
import { executeSql, initializeStorage, querySql, snapshot } from './storage.js';

export const GO_CM_AGENCY_IDS = ['LA77N', 'BNA17', 'YA15B', 'A2L1N'];
export const LEGACY_CM_AGENCY_IDS = ['41', '42', '43', '44'];

let REFERENCES_LOADED = false;

function isoDate(date: Dates) {
	if (!date.iso) throw new Error('Invalid Performance date');
	return date.iso.slice(0, 10);
}

export async function runMetrics(cadence: Cadence) {
	await initializeStorage();
	if (!REFERENCES_LOADED || cadence === 'hourly' || cadence === 'daily') {
		const { loadAgencies } = await import('./agency-loader.js');
		const { loadCalendar } = await import('./reference-loader.js');
		const loaders = [loadAgencies];
		if (!REFERENCES_LOADED || cadence === 'daily') loaders.push(loadCalendar);
		let succeeded = true;
		for (const load of loaders) {
			try {
				await load();
			} catch (error) {
				succeeded = false;
				Logger.error({ error, message: 'Reference refresh failed; retaining the last completed copy' });
			}
		}
		REFERENCES_LOADED = succeeded;
	}

	const now = Dates.now('Europe/Lisbon');
	const previous = now.minus({ days: 7 });
	const day = Dates.fromOperationalDateInt(now.operational_date_int, 'Europe/Lisbon');
	const previousDay = Dates.fromOperationalDateInt(previous.operational_date_int, 'Europe/Lisbon');
	const today = isoDate(day);
	const [limits] = cadence === 'realtime' ? [{ end_date: today }] : await querySql<{ end_date: string }>('storage/limits.sql', { agency_ids: GO_CM_AGENCY_IDS, today });
	if (!limits) throw new Error('Ride date bounds unavailable');
	const failed = new Set<string>();

	for (const metric of METRICS) {
		if (cadence !== 'daily' && metric.cadence !== cadence) continue;
		if (cadence === 'daily' && metric.cadence === 'realtime') continue;
		if (metric.dependencies.some(id => failed.has(id))) {
			failed.add(metric.id);
			continue;
		}
		try {
			const dependencies: string[] = [...metric.dependencies];
			if (metric.calendar) dependencies.push('__calendar');
			if (metric.pricing) dependencies.push('__agencies');
			for (const dependency of dependencies) {
				if (!(await snapshot([dependency])).length) throw new Error(`Missing completed input: ${dependency}`);
			}
			const inputRuns = await snapshot(dependencies);
			const initialized = (await snapshot([metric.id])).length > 0;
			const start = metric.daily && cadence === 'hourly' && initialized ? isoDate(day.minus({ days: 6 })) : '2024-01-01';
			const end = metric.id.startsWith('supply_by_agency_') ? limits.end_date : today;
			const runId = randomUUID();
			const referenceAt = Date.now();
			await executeSql(`metrics/${metric.id}.sql`, {
				agency_ids: GO_CM_AGENCY_IDS,
				current_date: now.operational_date_int,
				current_start: day.unix_milliseconds,
				end_date: end,
				input_runs: inputRuns,
				legacy_agency_ids: LEGACY_CM_AGENCY_IDS,
				previous_date: previous.operational_date_int,
				previous_start: previousDay.unix_milliseconds,
				previous_until: previous.unix_milliseconds,
				reference_at: now.unix_milliseconds,
				run_id: runId,
				start_date: start,
			});
			await publish(metric.id, runId, metric.global ? '1970-01-01' : start, metric.global ? '1970-01-01' : end, referenceAt);
			Logger.info({ message: `Published ${metric.id}` });
		} catch (error) {
			failed.add(metric.id);
			Logger.error({ error, message: `Metric refresh failed: ${metric.id}; retaining previous results` });
		}
	}
	if (cadence === 'realtime') {
		const { runDemandByAgencyByOperationalDate } = await import('./demand/by-agency/by-agency-by-operational-date.js');
		await runDemandByAgencyByOperationalDate('realtime');
	}
	if (cadence === 'daily') {
		const { runDemandByAgencyByOperationalDate } = await import('./demand/by-agency/by-agency-by-operational-date.js');
		await runDemandByAgencyByOperationalDate('full');
		await executeSql('storage/cleanup.sql', { cutoff: Date.now() - 7 * 86_400_000 });
	}
	if (failed.size) throw new Error(`Failed metric refreshes: ${[...failed].join(', ')}`);
}
