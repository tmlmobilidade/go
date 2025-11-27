/* * */

import { type MergedGtfsExportConfig } from '@/types.js';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export interface ExportedPeriodsRow {
	period_id: 1 | 2 | 3
	period_name: string
}

/**
 * Export the periods.txt file.
 * @param exportConfig The export configuration.
 */
export async function exportPeriodsFile(exportConfig: MergedGtfsExportConfig) {
	//

	const parsedPeriodsRows: ExportedPeriodsRow[] = [
		{ period_id: 1, period_name: 'Período Escolar' },
		{ period_id: 2, period_name: 'Férias Escolares' },
		{ period_id: 3, period_name: 'Verão' },
	];

	await exportConfig.writers.periods.write(parsedPeriodsRows);

	await exportConfig.writers.periods.flush();

	Logger.info('Exported periods.txt file.');
}
