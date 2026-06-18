/* * */

import { DAY_TYPES } from '@/day-types.js';
import { DayTypesExt, type ExportToHitouchConfig } from '@/types.js';
import { Logger } from '@tmlmobilidade/logger';
import { CsvWriter } from '@tmlmobilidade/writers';

/* * */

export async function exportDayTypesFile(exportConfig: ExportToHitouchConfig) {
	//
	// Export day types file

	const dayTypesExtCsv = new CsvWriter('day_typesExt.txt', `${exportConfig.workdir}/day_typesExt.txt`, { batch_size: 100000 });

	for (const dayType of DAY_TYPES) {
		const parsedDayType: DayTypesExt = {
			day_type_id: dayType._id,
			friday: ['1', '2', '3', '4', '5'].includes(dayType.index.toString()) ? true : false,
			monday: ['1', '2', '3', '4', '5'].includes(dayType.index.toString()) ? true : false,
			name: dayType.name,
			saturday: [2, 5, 8].includes(dayType.index) ? true : false,
			sequence_number: dayType.index,
			sunday: [3, 6, 9].includes(dayType.index) ? true : false,
			thursday: ['1', '2', '3', '4', '5'].includes(dayType.index.toString()) ? true : false,
			tuesday: ['1', '2', '3', '4', '5'].includes(dayType.index.toString()) ? true : false,
			wednesday: ['1', '2', '3', '4', '5'].includes(dayType.index.toString()) ? true : false,
		};
		await dayTypesExtCsv.write(parsedDayType);
	}

	await dayTypesExtCsv.flush();

	Logger.info({ message: 'Exported day_typesExt.txt file.' });
}
