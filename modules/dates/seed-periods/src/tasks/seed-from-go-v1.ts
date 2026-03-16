/* * */

import { yearPeriods } from '@tmlmobilidade/interfaces';
import { type OperationalDate } from '@tmlmobilidade/types';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* * */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapping of period type from dates.txt to period IDs
const PERIOD_MAPPING: Record<string, string> = {
	1: '99H2R', // Período Escolar
	2: '2KIUJ', // Férias Escolares
	3: 'UW2U0', // Verão
};

interface DateEntry {
	date: string
	day_type: string
	holiday: string
	notes: string
	period: string
}

export async function seedFromGoV1() {
	try {
		//

		//
		// Read and parse dates.txt file

		const datesFilePath = path.join(__dirname, '../../dates.txt');
		const datesFileContent = fs.readFileSync(datesFilePath, 'utf-8');
		const lines = datesFileContent.split('\n').filter(line => line.trim() !== '');

		// Skip header line
		const dateEntries: DateEntry[] = lines.slice(1).map((line) => {
			const [date, day_type, holiday, notes, period] = line.split(',');
			return { date, day_type, holiday, notes, period };
		});

		console.log(`Read ${dateEntries.length} date entries from dates.txt`);

		//
		// Group dates by period

		const datesByPeriod: Record<string, string[]> = {
			1: [],
			2: [],
			3: [],
		};

		for (const entry of dateEntries) {
			if (entry.period && datesByPeriod[entry.period]) {
				datesByPeriod[entry.period].push(entry.date);
			}
		}

		console.log(`Período Escolar: ${datesByPeriod[1].length} dates`);
		console.log(`Férias Escolares: ${datesByPeriod[2].length} dates`);
		console.log(`Verão: ${datesByPeriod[3].length} dates`);

		//
		// Update each period with its dates

		for (const [periodType, yearPeriodId] of Object.entries(PERIOD_MAPPING)) {
			const datesToUpdate = datesByPeriod[periodType] || [];

			if (datesToUpdate.length === 0) {
				console.log(`No dates found for period ${yearPeriodId}, skipping`);
				continue;
			}

			// Calculate start and end dates for logging
			const sortedDates = datesToUpdate.sort();
			const startDate = sortedDates[0];
			const endDate = sortedDates[sortedDates.length - 1];

			await yearPeriods.updateOne(
				{ _id: yearPeriodId },
				{
					dates: datesToUpdate as OperationalDate[],
					updated_by: 'system',
				},
			);

			console.log(`Updated period ${yearPeriodId} with ${datesToUpdate.length} dates (${startDate} to ${endDate})`);
		}

		console.log('All periods updated successfully');

		//
	}
	catch (err) {
		console.error('Error updating periods:', err);
		process.exit(1);
	}
}
