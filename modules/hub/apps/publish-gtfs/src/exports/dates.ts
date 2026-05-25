/* eslint-disable perfectionist/sort-objects */

import { type ExportGtfsContext } from '@/types/context.js';
import { Logger } from '@tmlmobilidade/logger';
import { type OperationalDate } from '@tmlmobilidade/types';

/* * */

export interface ExportedDatesRow {
	date: OperationalDate
	day_type: '1' | '2' | '3'
	holiday: '0' | '1'
	notes: string
	period: '1' | '2' | '3'
}

interface DateObjApiResponse {
	date: OperationalDate
	day_type: '1' | '2' | '3'
	holiday: '0' | '1'
	holiday_name: string
	notes: string
	period: '1' | '2' | '3'
	weekday: string
}

/**
 * Export the dates.txt file.
 * @param context The export context.
 */
export async function exportDatesFile(context: ExportGtfsContext) {
	//

	//
	// Fetch dates from GO v1 API

	const allDatesRes = await fetch('https://go.carrismetropolitana.pt/api/dates/public');
	const allDatesData = await allDatesRes.json() as DateObjApiResponse[];

	//
	// Parse and write dates

	for (const dateData of allDatesData) {
		const parsedDatesRow: ExportedDatesRow = {
			date: dateData.date,
			day_type: dateData.day_type,
			period: dateData.period,
			holiday: dateData.holiday,
			notes: dateData.holiday_name,
		};
		await context.writers.dates.write(parsedDatesRow);
	}

	await context.writers.dates.flush();

	Logger.info('Exported dates.txt file.');
}
