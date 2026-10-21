/* * */

import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { buildCalendarRows, readServiceDates } from '../src/calendar.js';

/* * */

async function withFeed(files: Record<string, string>, callback: (directory: string) => Promise<void>) {
	const directory = await mkdtemp(path.join(os.tmpdir(), 'operation-stepp-calendar-'));
	try {
		await Promise.all(Object.entries(files).map(([name, content]) => writeFile(path.join(directory, name), content)));
		await callback(directory);
	} finally {
		await rm(directory, { force: true, recursive: true });
	}
}

test('clips weekly service and applies additions and removals across the Lisbon DST change', async () => {
	await withFeed({
		'calendar_dates.txt': 'service_id,date,exception_type\nweekdays,20260327,2\nweekdays,20260329,1\nweekdays,20260330,1\nweekdays,20260401,1\n',
		'calendar.txt': 'service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date\nweekdays,1,1,1,1,1,0,0,20260301,20260430\n',
	}, async (directory) => {
		const services = await readServiceDates(directory, '20260326', '20260331');
		assert.deepEqual(Array.from(services.get('weekdays') ?? []).sort(), ['20260326', '20260329', '20260330', '20260331']);
	});
});

test('supports calendar_dates alone and removes services without active dates', async () => {
	await withFeed({
		'calendar_dates.txt': 'service_id,date,exception_type\nonly,20261025,1\nonly,20261026,1\nonly,20261026,2\nremoved,20261025,1\nremoved,20261025,2\nabsent,20261025,2\n',
	}, async (directory) => {
		const services = await readServiceDates(directory, '20261025', '20261026');
		assert.deepEqual(Array.from(services.keys()), ['only']);
		assert.deepEqual(Array.from(services.get('only') ?? []), ['20261025']);
	});
});

test('calendar flags never activate an omitted weekday occurrence', () => {
	const rows = buildCalendarRows('service', new Set(['20261019', '20261020', '20261026', '20261102', '20261103']));
	assert.deepEqual(rows.calendar, {
		end_date: '20261103',
		friday: '0',
		monday: '1',
		saturday: '0',
		service_id: 'service',
		start_date: '20261019',
		sunday: '0',
		thursday: '0',
		tuesday: '0',
		wednesday: '0',
	});
	assert.deepEqual(Object.keys(rows.calendar), ['service_id', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'end_date', 'start_date']);
	assert.deepEqual(rows.calendarDates.map(row => row.date), ['20261019', '20261020', '20261026', '20261102', '20261103']);
	assert.ok(rows.calendarDates.every(row => row.exception_type === '1' && row.service_id === 'service'));
});

test('rejects impossible dates, reversed ranges, and malformed exceptions', async () => {
	await withFeed({ 'calendar_dates.txt': 'service_id,date,exception_type\nservice,20260230,1\n' }, async (directory) => {
		await assert.rejects(readServiceDates(directory, '20260101', '20261231'), /not a calendar date/);
		await assert.rejects(readServiceDates(directory, '20260102', '20260101'), /after end_date/);
	});
	await withFeed({ 'calendar_dates.txt': 'service_id,date,exception_type\nservice,20260101,3\n' }, async (directory) => {
		await assert.rejects(readServiceDates(directory, '20260101', '20261231'), /Invalid exception_type/);
	});
	assert.throws(() => buildCalendarRows('service', new Set()), /no operating dates/);
});

test('rejects invalid weekday flags', async () => {
	await withFeed({
		'calendar.txt': 'service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date\nservice,2,1,1,1,1,0,0,20260101,20261231\n',
	}, async (directory) => {
		await assert.rejects(readServiceDates(directory, '20260101', '20261231'), /Invalid monday/);
	});
});
