/* eslint-disable perfectionist/sort-objects */
/* * */

import { streamCsvFile } from '@tmlmobilidade/go-utils-exec';
import fs from 'node:fs';
import path from 'node:path';

/* * */

export type CsvRow = Record<string, string | undefined>;

const WEEKDAY_FIELDS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

/* * */

function requiredValue(row: CsvRow, field: string, fileName: string): string {
	const value = row[field];
	if (!value) throw new Error(`Missing ${field} in ${fileName}.`);
	return value;
}

function toUtcTimestamp(value: string, field: string): number {
	if (!/^\d{8}$/.test(value)) throw new Error(`Invalid ${field}: "${value}". Expected YYYYMMDD.`);
	const year = Number(value.slice(0, 4));
	const month = Number(value.slice(4, 6));
	const day = Number(value.slice(6, 8));
	const date = new Date(0);
	date.setUTCFullYear(year, month - 1, day);
	if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
		throw new Error(`Invalid ${field}: "${value}" is not a calendar date.`);
	}
	return date.getTime();
}

function fromUtcTimestamp(timestamp: number): string {
	return new Date(timestamp).toISOString().slice(0, 10).replaceAll('-', '');
}

/** Resolves actual operating dates from the source calendars inside the inclusive export range. */
export async function readServiceDates(sourceDirectory: string, startDate: string, endDate: string): Promise<Map<string, Set<string>>> {
	const rangeStart = toUtcTimestamp(startDate, 'start_date');
	const rangeEnd = toUtcTimestamp(endDate, 'end_date');
	if (rangeStart > rangeEnd) throw new Error(`start_date (${startDate}) is after end_date (${endDate}).`);

	const calendarPath = path.join(sourceDirectory, 'calendar.txt');
	const calendarDatesPath = path.join(sourceDirectory, 'calendar_dates.txt');
	const hasCalendar = fs.existsSync(calendarPath);
	const hasCalendarDates = fs.existsSync(calendarDatesPath);
	if (!hasCalendar && !hasCalendarDates) throw new Error('The plan GTFS has no calendar.txt or calendar_dates.txt.');

	const services = new Map<string, Set<string>>();
	const calendarServiceIds = new Set<string>();

	if (hasCalendar) {
		await streamCsvFile<CsvRow>(calendarPath, async (row) => {
			const serviceId = requiredValue(row, 'service_id', 'calendar.txt');
			if (calendarServiceIds.has(serviceId)) throw new Error(`Duplicate service_id "${serviceId}" in calendar.txt.`);
			calendarServiceIds.add(serviceId);

			const serviceStart = toUtcTimestamp(requiredValue(row, 'start_date', 'calendar.txt'), 'calendar.txt start_date');
			const serviceEnd = toUtcTimestamp(requiredValue(row, 'end_date', 'calendar.txt'), 'calendar.txt end_date');
			if (serviceStart > serviceEnd) throw new Error(`Service "${serviceId}" has start_date after end_date in calendar.txt.`);

			for (const field of WEEKDAY_FIELDS) {
				if (row[field] !== '0' && row[field] !== '1') throw new Error(`Invalid ${field} for service "${serviceId}" in calendar.txt. Expected 0 or 1.`);
			}

			const dates = new Set<string>();
			const clippedEnd = Math.min(serviceEnd, rangeEnd);
			for (let timestamp = Math.max(serviceStart, rangeStart); timestamp <= clippedEnd; timestamp += ONE_DAY_IN_MS) {
				const weekday = WEEKDAY_FIELDS[new Date(timestamp).getUTCDay()];
				if (row[weekday] === '1') dates.add(fromUtcTimestamp(timestamp));
			}
			services.set(serviceId, dates);
		});
	}

	if (hasCalendarDates) {
		await streamCsvFile<CsvRow>(calendarDatesPath, async (row) => {
			const serviceId = requiredValue(row, 'service_id', 'calendar_dates.txt');
			const date = requiredValue(row, 'date', 'calendar_dates.txt');
			const timestamp = toUtcTimestamp(date, 'calendar_dates.txt date');
			if (row.exception_type !== '1' && row.exception_type !== '2') throw new Error(`Invalid exception_type for service "${serviceId}" in calendar_dates.txt. Expected 1 or 2.`);
			if (timestamp < rangeStart || timestamp > rangeEnd) return;

			if (row.exception_type === '1') {
				const dates = services.get(serviceId) ?? new Set<string>();
				dates.add(date);
				services.set(serviceId, dates);
			} else {
				services.get(serviceId)?.delete(date);
			}
		});
	}

	for (const [serviceId, dates] of services) {
		if (dates.size === 0) services.delete(serviceId);
	}
	return services;
}

/** Builds both calendar representations from the same resolved dates, matching the STePP export. */
export function buildCalendarRows(serviceId: string, dates: Set<string>) {
	const sortedDates = Array.from(dates).sort();
	if (sortedDates.length === 0) throw new Error(`Service "${serviceId}" has no operating dates.`);

	const servedByWeekday = [0, 0, 0, 0, 0, 0, 0];
	for (const date of sortedDates) {
		servedByWeekday[new Date(toUtcTimestamp(date, 'service date')).getUTCDay()]++;
	}

	const occurrencesByWeekday = [0, 0, 0, 0, 0, 0, 0];
	const firstDate = sortedDates[0];
	const lastDate = sortedDates[sortedDates.length - 1];
	const endTimestamp = toUtcTimestamp(lastDate, 'service end_date');
	for (let timestamp = toUtcTimestamp(firstDate, 'service start_date'); timestamp <= endTimestamp; timestamp += ONE_DAY_IN_MS) {
		occurrencesByWeekday[new Date(timestamp).getUTCDay()]++;
	}

	const weekdays = WEEKDAY_FIELDS.map((_, index) => servedByWeekday[index] > 0 && servedByWeekday[index] === occurrencesByWeekday[index] ? '1' : '0');
	return {
		calendar: {
			service_id: serviceId,
			monday: weekdays[1],
			tuesday: weekdays[2],
			wednesday: weekdays[3],
			thursday: weekdays[4],
			friday: weekdays[5],
			saturday: weekdays[6],
			sunday: weekdays[0],
			end_date: lastDate,
			start_date: firstDate,
		},
		calendarDates: sortedDates.map(date => ({ date, exception_type: '1', service_id: serviceId })),
	};
}
