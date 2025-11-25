/* * */

import { type ExportToHitouchConfig } from '@/types.js';
import { CsvWriter } from '@tmlmobilidade/writers';
import { Logger } from '@tmlmobilidade/logger';
import { type Plan } from '@tmlmobilidade/types';

/* * */

export async function exportAgencyFile(planData: Plan, exportConfig: ExportToHitouchConfig) {
	//
	// Export agency file

	const agencyCsv = new CsvWriter('agency.txt', `${exportConfig.workdir}/agency.txt`, { batch_size: 10000 });

	await agencyCsv.write(planData.gtfs_agency);

	await agencyCsv.flush();

	Logger.info('Exported agency.txt file.');
}
