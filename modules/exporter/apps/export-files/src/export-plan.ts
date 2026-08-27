import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type FileExport, type PlanExportProperties } from '@tmlmobilidade/go-types-downloads';
import { Logger } from '@tmlmobilidade/logger';
import { generateRandomString } from '@tmlmobilidade/strings';
import { Timer } from '@tmlmobilidade/timer';
import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/* * */

/**
 * Downloads a plan's operation file to a temporary file.
 * @param fileExport The file export object.
 * @returns The path to the downloaded file.
 */
export async function exportPlanFile(fileExport: FileExport): Promise<string> {
	//

	if (fileExport.type !== 'plan') throw new Error(`File export type is not plan: ${fileExport.type}.`);

	if (!fileExport.properties) throw new Error('File export properties is missing.');

	//
	// Setup a timer and mark the export as processing

	const timer = new Timer();

	await goDb.core.exports.updateById(fileExport._id, { processing_status: 'processing' });

	//
	// Get the plan properties

	const properties = fileExport.properties as PlanExportProperties['properties'];

	//
	// Get the plan data

	const planData = await goDb.operation.plans.findById(properties.plan_id);
	if (!planData) {
		throw new Error(`Plan ${properties.plan_id} not found for export ${fileExport._id}`);
	}

	if (planData.agency_id !== properties.agency_id) {
		throw new Error(`Plan ${planData._id} does not belong to agency ${properties.agency_id}`);
	}

	if (!planData.operation_file_id) {
		throw new Error(`Plan ${planData._id} has no operation file`);
	}

	//
	// Get the operation file

	const operationFile = await storageProvider.findById(planData.operation_file_id);
	if (!operationFile) {
		throw new Error(`Operation file ${planData.operation_file_id} not found for plan ${planData._id}`);
	}

	//
	// Download the operation file to a temporary path

	if (!operationFile.url) {
		throw new Error(`Operation file ${operationFile._id} has no download URL`);
	}

	const response = await fetch(operationFile.url);
	if (!response.ok || !response.body) {
		throw new Error(`Failed to download operation file ${operationFile._id}: ${response.status} ${response.statusText}`);
	}

	const tempFilePath = join(tmpdir(), `${generateRandomString()}-${fileExport.file_name}`);
	await writeFile(tempFilePath, Buffer.from(await response.arrayBuffer()));

	//
	// Log the result

	Logger.success(`Exported plan ${planData._id} in ${timer.get()}`, 1);
	Logger.info({ message: `File path: ${tempFilePath}` });
	Logger.spacer(1);

	return tempFilePath;
}
