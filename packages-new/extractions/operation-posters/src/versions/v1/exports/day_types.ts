/* * */

import { type DayTypesExt } from '@tmlmobilidade/go-types-gtfs-hitouch';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { DAY_TYPES } from '../day-types.js';
import { type OperationPostersV1Context } from '../types/context.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

export async function exportDayTypesFile(context: OperationPostersV1Context) {
	//

	//
	// A. Export day types file

	let exportedRows = 0;

	for (const dayType of DAY_TYPES) {
		const dayTypeExt: DayTypesExt = {
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
		await context.writers.day_types_ext.write(dayTypeExt);
		await yieldToEventLoop(++exportedRows);
	}

	//
	// B. Flush the day types file

	await context.writers.day_types_ext.flush();

	Logger.info({ message: 'Exported day_typesExt.txt file.' });
}
