/* * */

import { type ExportToHitouchConfig } from '@/types.js';
import { CsvWriter } from '@helperkits/writer';
import { type Plan } from '@go/types';
import { Logs } from '@go/utils';

/* * */

export async function exportAgencyFile(planData: Plan, exportConfig: ExportToHitouchConfig) {
	//
	// Export agency file

	const agencyCsv = new CsvWriter('agency.txt', `${exportConfig.workdir}/agency.txt`, { batch_size: 10000 });

	await agencyCsv.write(planData.gtfs_agency);

	await agencyCsv.flush();

	Logs.info('Exported agency.txt file.');
}
