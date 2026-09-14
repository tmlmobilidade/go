/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type FileExport, type PlanPostersExportProperties } from '@tmlmobilidade/go-types-downloads';

import { generatePlanPostersDownloadUrl } from './pipeline.js';

/* * */

export async function exportPlanPostersFile(fileExport: FileExport): Promise<string> {
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

	if (!planData.attachments.operation_gtfs) {
		throw new Error(`Plan ${planData._id} has no operation GTFS attachment for poster export`);
	}

	const contentMode = properties.content_mode ?? (properties.stop_ids?.length ? 'stops' : properties.line_ids?.length ? 'lines' : 'all');
	const selectedStopIds = (contentMode === 'stops' || contentMode === 'lines_stops') ? properties.stop_ids ?? [] : [];
	const stopsMode = properties.stops_mode ?? 'include';

	const linesMode = properties.lines_mode ?? (properties.line_ids?.length ? 'include' : 'all');
	const selectedLineIds = (contentMode === 'lines' || contentMode === 'lines_stops') ? properties.line_ids ?? [] : [];
	if ((contentMode === 'lines' || contentMode === 'lines_stops') && !selectedLineIds.length) {
		throw new Error(`Poster export ${fileExport._id} requires selected lines for ${linesMode} mode.`);
	}

	if ((contentMode === 'stops' || contentMode === 'lines_stops') && !selectedStopIds.length) {
		throw new Error(`Poster export ${fileExport._id} requires selected stops for ${stopsMode} mode.`);
	}

	return generatePlanPostersDownloadUrl(planData, fileExport._id, {
		canvas_profile: properties.canvas_profile,
		content_mode: contentMode,
		line_codes: selectedLineIds,
		lines_mode: linesMode,
		stop_ids: selectedStopIds,
		stops_mode: stopsMode,
	});
}
