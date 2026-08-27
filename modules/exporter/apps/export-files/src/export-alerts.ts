/* * */

import { alerts, fileExports } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { generateRandomString } from '@tmlmobilidade/strings';
import { Timer } from '@tmlmobilidade/timer';
import { AlertExportProperties, FileExport } from '@tmlmobilidade/types';
import { CsvWriter } from '@tmlmobilidade/writers';
import os from 'os';
import path from 'path';

import { AlertExportCsvData, parseAlerts } from './lib/parse-alerts.js';

/* * */

function getAlertIdsFromExportProperties(properties: AlertExportProperties['properties']): string[] {
	const alertIds = properties.alert_ids ?? [];
	return [...new Set(alertIds.map(id => id.trim()).filter(Boolean))];
}

/* * */

/**
 * Exports a batch of alerts to a CSV file.
 * @param fileExport The file export object.
 * @returns The path to the exported file.
 */
export async function exportAlertsFile(fileExport: FileExport): Promise<string> {
	console.log('=======>>>', getAlertIdsFromExportProperties);
	//
	if (fileExport.type !== 'alert') throw new Error(`File export type is not alert: ${fileExport.type}.`);

	if (!fileExport.properties) throw new Error('File export properties is missing.');

	//
	// Setup a timer to track the execution time
	const timer = new Timer();

	await fileExports.updateById(fileExport._id, { processing_status: 'processing' });

	//
	// Build alert ids from export properties
	const properties = fileExport.properties as AlertExportProperties['properties'];
	const alertIds = getAlertIdsFromExportProperties(properties);
	Logger.info({ message: `IDS: ${alertIds}` });
	const alertsCollection = await alerts.getCollection();
	const alertsCursor = alertsCollection.find({ _id: { $in: alertIds } }, { batchSize: 5000 });

	//
	// Write the alert batch to the file
	const tempFilePath = path.join(os.tmpdir(), `${fileExport.file_name}_${generateRandomString()}.csv`);
	const csvWriter = new CsvWriter<AlertExportCsvData>(fileExport.file_name, tempFilePath, { batch_size: 10000, include_bom: true });
	let count = 0;
	for await (const alert of alertsCursor) {
		await csvWriter.write(parseAlerts({ _id: alert._id, alert }));
		count++;
	}

	await csvWriter.flush();

	Logger.success(`Exported ${count} alerts in ${timer.get()}`, 1);
	Logger.info({ message: `File path: ${tempFilePath}` });
	Logger.spacer(1);

	return tempFilePath;
}
