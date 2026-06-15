#!/usr/bin/env node

import { promptAccessKey } from '@/prompts/access-key.js';
import { promptExportTypes } from '@/prompts/export-types.js';
import { promptFilterByAgencyIds } from '@/prompts/filter-agency-ids.js';
import { promptFilterByDates } from '@/prompts/filter-dates.js';
import { promptFilterByLineIds } from '@/prompts/filter-line-ids.js';
import { promptFilterByPatternIds } from '@/prompts/filter-pattern-ids.js';
import { promptFilterByStopIds } from '@/prompts/filter-stop-ids.js';
import { promptFilterTypes } from '@/prompts/filter-types.js';
import { promptFilterByVehicleIds } from '@/prompts/filter-vehicle-ids.js';
import { promptHashedShapeIds } from '@/prompts/hashedshape-ids.js';
import { promptValidationGroupFields } from '@/prompts/validation-group-fields.js';
import { exportValidationsAggregated, type ValidationGroupField } from '@/tasks/apex-validations/validations-aggregated.js';
import { exportValidationsRaw } from '@/tasks/apex-validations/validations-raw.js';
import { exportHashedShapesGeoJSON } from '@/tasks/hashed-shapes/hashed-shapes-geojson.js';
import { exportRidesRaw } from '@/tasks/rides/rides-raw.js';
import { exportSamsRaw } from '@/tasks/sams/sams-raw.js';
import { exportVehicleEventsRaw } from '@/tasks/vehicle-events/vehicle-events-raw.js';
import { exportTypeLabels, exportTypesWithoutEntityFilters, exportTypesWithoutFilters } from '@/types.js';
import { initExportContext } from '@/utils/init-context.js';
import { intro, log, outro, tasks } from '@clack/prompts';
import { ASCII_CM_SHORT } from '@tmlmobilidade/consts';
import { exportValidationsPMunicipalities } from './tasks/municipalities-validations/validations_p_municipalities.js';

import { exportExecutiveSummary } from './tasks/executive-summary-setup/index.js';

/* * */

await (async function main() {
	//

	//
	// Initialize the export context

	const context = initExportContext();

	//
	// Greet the user

	console.log(ASCII_CM_SHORT.replace(/▒/g, '\x1b[33m▒\x1b[0m'));

	intro('Bem-vindo ao exportador de dados da CM!');

	log.info(`A versão da aplicação é: ${context.app_version}`);
	log.info(`O ID desta exportação é: ${context._id}`);
	log.info(`Todos os resultados serão guardados aqui: ${context.output}`);

	//
	// Prompt for the access key

	await promptAccessKey();

	//
	// Request the export types and which filters to apply

	const exportTypes = await promptExportTypes();

	//
	// Check if all selected export types don't require entity filters or dates

	const shouldSkipEntityFilters = exportTypes.length > 0 && exportTypes.every(type =>
		exportTypesWithoutEntityFilters.includes(type) || exportTypesWithoutFilters.includes(type),
	);
	const shouldSkipDates = exportTypes.length > 0 && exportTypes.every(type => exportTypesWithoutFilters.includes(type));

	//
	// For hashed_shapes export, prompt for hashedshape IDs

	let hashedShapeIds: string[] = [];
	if (exportTypes.includes('hashed-shapes-geojson')) {
		hashedShapeIds = await promptHashedShapeIds();
	}

	//
	// For validations-aggregated export, prompt for group fields

	let validationGroupFields: ValidationGroupField[] = [];
	if (exportTypes.includes('validations-aggregated')) {
		validationGroupFields = await promptValidationGroupFields();
	}

	//
	// Skip entity filters and/or dates when all selected export types don't require them

	if (!shouldSkipEntityFilters) {
		const filterTypes = await promptFilterTypes();

		//
		// For the selected filters, request the filter values

		if (filterTypes.includes('agency-ids')) context.filters.agency_ids = await promptFilterByAgencyIds();
		if (filterTypes.includes('line-ids')) context.filters.line_ids = await promptFilterByLineIds();
		if (filterTypes.includes('pattern-ids')) context.filters.pattern_ids = await promptFilterByPatternIds();
		if (filterTypes.includes('stop-ids')) context.filters.stop_ids = await promptFilterByStopIds();
		if (filterTypes.includes('vehicle-ids')) context.filters.vehicle_ids = await promptFilterByVehicleIds();
	}

	if (!shouldSkipDates) {
		context.dates = await promptFilterByDates();
	}

	//
	// Build the tasks array for the selected export types

	await tasks([

		{
			enabled: exportTypes.includes('validations-raw'),
			task: async message => await exportValidationsRaw({ context, message }),
			title: exportTypeLabels['validations-raw'],
		},

		{
			enabled: exportTypes.includes('validations-aggregated'),
			task: async message => await exportValidationsAggregated({ context, groupFields: validationGroupFields, message }),
			title: exportTypeLabels['validations-aggregated'],
		},

		{
			enabled: exportTypes.includes('rides-raw'),
			task: async message => await exportRidesRaw({ context, message }),
			title: exportTypeLabels['rides-raw'],
		},

		{
			enabled: exportTypes.includes('vehicle-events-raw'),
			task: async message => await exportVehicleEventsRaw({ context, message }),
			title: exportTypeLabels['vehicle-events-raw'],
		},

		{
			enabled: exportTypes.includes('hashed-shapes-geojson'),
			task: async message => await exportHashedShapesGeoJSON({ context, hashedShapeIds, message }),
			title: exportTypeLabels['hashed-shapes-geojson'],
		},

		{
			enabled: exportTypes.includes('sams-raw'),
			task: async message => await exportSamsRaw({ context, message }),
			title: exportTypeLabels['sams-raw'],
		},
		{
			enabled: exportTypes.includes('executive-summary'),
			task: async message => await exportExecutiveSummary({ context, message }),
			title: exportTypeLabels['executive-summary'],
		},
		{
			enabled: exportTypes.includes('validations-p-municipalities'),
			task: async message => await exportValidationsPMunicipalities({ context, message }),
			title: exportTypeLabels['validations-p-municipalities'],
		},
	]);

	//
	// Terminate the process

	outro('Exportação terminada.');

	process.exit(0);

	//
})().catch(console.error);
