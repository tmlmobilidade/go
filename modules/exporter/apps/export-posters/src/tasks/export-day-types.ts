/* * */

import { Logger } from '@tmlmobilidade/logger';
import { CsvWriter } from '@tmlmobilidade/writers';

import { type DayTypesExt, type ExportToHitouchConfig } from '../types.js';
import { DAY_TYPES } from '../utils/day-types.js';

/* * */

/**
 * Exports the day_typesExt.txt file from the day types configuration.
 * @param exportConfig The export configuration.
 */
export async function exportDayTypesFile(exportConfig: ExportToHitouchConfig) {
	//

	//
	// Export day types file

	const dayTypesExtCsv = new CsvWriter('day_typesExt.txt', `${exportConfig.workdir}/day_typesExt.txt`, { batch_size: 100000 });

	for (const dayType of DAY_TYPES) {
		const isBusinessDay = ['1', '2', '3', '4', '5'].includes(dayType.index.toString());
		const parsedDayType: DayTypesExt = {
			day_type_id: dayType._id,
			friday: isBusinessDay,
			monday: isBusinessDay,
			name: dayType.name,
			saturday: [2, 5, 8].includes(dayType.index),
			sequence_number: dayType.index,
			sunday: [3, 6, 9].includes(dayType.index),
			thursday: isBusinessDay,
			tuesday: isBusinessDay,
			wednesday: isBusinessDay,
		};
		await dayTypesExtCsv.write(parsedDayType);
	}

	await dayTypesExtCsv.flush();

	Logger.info({ message: 'Exported day_typesExt.txt file.' });

	//
}
