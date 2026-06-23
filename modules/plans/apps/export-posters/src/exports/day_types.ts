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
		const isWeekday = [1, 4, 7].includes(dayType.index);

		const parsedDayType: DayTypesExt = {
			day_type_id: dayType._id,
			friday: isWeekday,
			monday: isWeekday,
			name: dayType.name,
			saturday: [2, 5, 8].includes(dayType.index),
			sequence_number: dayType.index,
			sunday: [3, 6, 9].includes(dayType.index),
			thursday: isWeekday,
			tuesday: isWeekday,
			wednesday: isWeekday,
		};
		await dayTypesExtCsv.write(parsedDayType);
	}

	await dayTypesExtCsv.flush();

	Logger.info({ message: 'Exported day_typesExt.txt file.' });
}
