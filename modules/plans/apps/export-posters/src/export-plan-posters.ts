/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type Attachment, type FileExport, type PlanPostersExportProperties } from '@tmlmobilidade/types';

import { generatePlanPostersZip } from './pipeline.js';

/* * */

export async function exportPlanPostersFile(fileExport: FileExport): Promise<Attachment> {
	if (fileExport.type !== 'plan_posters') {
		throw new Error(`File export type is not plan_posters: ${fileExport.type}.`);
	}

	const properties = fileExport.properties as PlanPostersExportProperties['properties'];

	const planData = await goDb.operation.plans.findById(properties.plan_id);
	if (!planData) {
		throw new Error(`Plan ${properties.plan_id} not found for poster export ${fileExport._id}`);
	}

	if (planData.agency_id !== properties.agency_id) {
		throw new Error(`Plan ${planData._id} does not belong to agency ${properties.agency_id}`);
	}

	if (!planData.operation_file_id) {
		throw new Error(`Plan ${planData._id} has no operation file for poster export`);
	}

	const pdfZip = await generatePlanPostersZip(planData, fileExport._id);

	return storageProvider.upload(pdfZip, {
		created_by: 'system',
		name: fileExport.file_name,
		resource_id: fileExport._id,
		scope: 'exports',
		size: pdfZip.byteLength,
		type: 'application/zip',
		updated_by: 'system',
	});
}
