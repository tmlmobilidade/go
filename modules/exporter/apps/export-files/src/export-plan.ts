import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type Attachment, type FileExport, type PlanExportProperties } from '@tmlmobilidade/types';

/* * */

export async function exportPlanFile(fileExport: FileExport): Promise<Attachment> {
	const properties = fileExport.properties as PlanExportProperties['properties'];

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

	const operationFile = await storageProvider.findById(planData.operation_file_id);
	if (!operationFile) {
		throw new Error(`Operation file ${planData.operation_file_id} not found for plan ${planData._id}`);
	}

	const exportedFile = await storageProvider.copy(operationFile._id, 'exports', fileExport._id);

	return goDb.core.attachments.updateById(exportedFile._id, {
		name: `gtfs-${planData._id}.zip`,
	});
}
