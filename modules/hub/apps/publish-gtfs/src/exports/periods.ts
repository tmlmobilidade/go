/* * */

import { type ExportGtfsContext } from '@/types/context.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export interface ExportedPeriodsRow {
	period_id: 1 | 2 | 3
	period_name: string
}

/**
 * Export the periods.txt file.
 * @param context The export context.
 */
export async function exportPeriodsFile(context: ExportGtfsContext) {
	//

	const timer = new Timer();

	Logger.info('Exporting periods.txt file...');

	const parsedPeriodsRows: ExportedPeriodsRow[] = [
		{ period_id: 1, period_name: 'Período Escolar' },
		{ period_id: 2, period_name: 'Férias Escolares' },
		{ period_id: 3, period_name: 'Verão' },
	];

	await context.writers.periods.write(parsedPeriodsRows);

	await context.writers.periods.flush();

	Logger.success(`Exported periods.txt file in ${timer.get()}.`);
}
