/* * */

import { Logger } from '@tmlmobilidade/logger';

import { DAY_TYPES } from '../day-types.js';
import { type OperationPostersV1Context } from '../types/context.js';
import { type DayTypesExt } from '../types/DayTypesExt.js';

/* * */

export async function exportDayTypesFile(context: OperationPostersV1Context) {
	//
	// Export day types file

	const dayTypesExtRows: DayTypesExt[] = DAY_TYPES.map((dayType) => {
		return {
			day_type_id: dayType._id,
			friday: '',
			monday: '',
			name: dayType.name,
			saturday: '',
			sequence_number: dayType.index,
			sunday: '',
			thursday: '',
			tuesday: '',
			wednesday: '',
		};
	});

	await context.writers.day_types_ext.write(dayTypesExtRows);
	await context.writers.day_types_ext.flush();

	Logger.info({ message: 'Exported day_typesExt.txt file.' });
}
