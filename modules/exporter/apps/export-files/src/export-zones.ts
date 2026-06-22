import { fileExports, zones } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { generateRandomString } from '@tmlmobilidade/strings';
import { Timer } from '@tmlmobilidade/timer';
import { FileExport, ZoneExportProperties } from '@tmlmobilidade/types';
import { CsvWriter } from '@tmlmobilidade/writers';
import os from 'os';
import path from 'path';

import { parseZones } from './lib/parse-zones.js';

/***/
function getZoneIdsFromExportProperties(properties: ZoneExportProperties['properties']): string[] {
	const zoneIds = properties.search.split (/[\s,]+/);
	return [...new Set(zoneIds.map(id => id.trim()).filter(Boolean))];
}
/***/

export async function exportZoneFile(fileExport: FileExport): Promise<string> {
	//
	if (fileExport.type !== 'zone') throw new Error(`File export type is not zone: ${fileExport.type}.`);

	if (!fileExport.properties) throw new Error('File export properties is missing.');
	//
	// Setup a timer to track the execution time
	const timer = new Timer();

	await fileExports.updateById(fileExport._id, { processing_status: 'processing' });

	//
	// Build zone from export properties
	const properties = fileExport.properties as ZoneExportProperties['properties'];
	const zoneIds = getZoneIdsFromExportProperties(properties);

	const query: Record<string, Record<string, string[]> | string> = {};
	if (zoneIds.length > 0) {
		query['_id'] = { $in: zoneIds };
	}

	const zonesCollection = await zones.getCollection();
	const zonesBatchCursor = zonesCollection.find(query, { batchSize: 5000 });

	//
	// Write the zones batch file
	const tempFilePath = path.join(os.tmpdir(), `${fileExport.file_name}_${generateRandomString()}.csv`);
	const csvWriter = new CsvWriter(fileExport.file_name, tempFilePath, { batch_size: 10000, include_bom: true });

	let count = 0;
	for await (const zone of zonesBatchCursor) {
		await csvWriter.write(parseZones({ _id: zone._id }));
		count++;
	}
	await csvWriter.flush();

	Logger.success(`Exported ${count} zone in ${timer.get()}`, 1);
	Logger.info({ message: `File path: ${tempFilePath}` });
	Logger.spacer(1);

	return tempFilePath;
}
