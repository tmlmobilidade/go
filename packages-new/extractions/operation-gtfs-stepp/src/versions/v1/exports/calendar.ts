/* * */

import { type PlanExportConfig } from '../types.js';
import { buildCalendarRows, readServiceDates } from '../utils/calendar.js';
import { groupSource, isNewerSource, rowSource } from '../utils/merge.js';
import { type SteppWriters } from '../utils/writers.js';

/* * */

/** Read and retain each plan's service dates for the final merge. */
export async function collectPlanCalendars(config: PlanExportConfig) {
	const services = await readServiceDates(config.sourceDirectory, config.startDate, config.endDate, true);
	for (const [id, dates] of services) {
		config.sharedRows.set(`calendar:${groupSource(id, config.planId)}`, { ...rowSource(config, { service_id: id }), dates });
	}
	return services;
}

/** Write merged calendars and globally date-ordered exceptions. */
export async function exportCalendars(sharedRows: PlanExportConfig['sharedRows'], writers: SteppWriters) {
	const usedServices = new Set<string>();
	for (const [key, source] of sharedRows) {
		if (key.startsWith('trips:')) usedServices.add(String(source.row.service_id));
	}
	const services = new Map<string, Set<string>>();
	// Resolve overlapping dates oldest first; disjoint months remain in the union.
	const calendars = [...sharedRows.entries()].filter(([key]) => key.startsWith('calendar:'))
		.map(([, source]) => source)
		.sort((a, b) => isNewerSource(a, b) ? 1 : isNewerSource(b, a) ? -1 : 0);
	for (const source of calendars) {
		const id = String(source.row.service_id);
		if (!usedServices.has(id)) continue;
		const dates = services.get(id) ?? new Set<string>();
		for (const date of dates) {
			if (date >= source.startDate && date <= source.endDate) dates.delete(date);
		}
		for (const date of source.dates ?? []) dates.add(date);
		services.set(id, dates);
	}
	const mergedCalendarDates: ReturnType<typeof buildCalendarRows>['calendarDates'] = [];
	for (const [id, dates] of services) {
		if (!dates.size) continue;
		const { calendar, calendarDates } = buildCalendarRows(id, dates);
		await writers.calendar.write(calendar);
		for (const row of calendarDates) mergedCalendarDates.push(row);
	}
	mergedCalendarDates.sort((a, b) => a.date.localeCompare(b.date) || a.service_id.localeCompare(b.service_id));
	for (const row of mergedCalendarDates) await writers.calendar_dates.write(row);
	return services;
}
