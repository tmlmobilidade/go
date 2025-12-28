#!/usr/bin/env node

import { initExportContext } from '@/init/init-context.js';
import { availableExportTypesLabels, promptExportTypes } from '@/prompts/export-types.js';
import { promptFilterByDates } from '@/prompts/filter-dates.js';
import { promptFilterByLineIds } from '@/prompts/filter-line-ids.js';
import { promptFilterByPatternIds } from '@/prompts/filter-pattern-ids.js';
import { promptFilterByStopIds } from '@/prompts/filter-stop-ids.js';
import { promptFilterTypes } from '@/prompts/filter-types.js';
import { exportValidationsRaw } from '@/tasks/apex-validations/validations-raw.js';
import { intro, log, outro, tasks } from '@clack/prompts';
import { ASCII_CM_SHORT } from '@tmlmobilidade/consts';

import { promptFilterByAgencyIds } from './prompts/filter-agency-ids.js';
import { promptFilterByVehicleIds } from './prompts/filter-vehicle-ids.js';

/* * */

(async function main() {
	//

	//
	// Initialize the export context

	const context = initExportContext();

	//
	// Greet the user

	console.log(ASCII_CM_SHORT);
	intro('Bem-vindo ao exportador de dados da CM!');
	log.info(`O ID desta exportação é: ${context._id}`);
	log.info(`Todos os resultados serão guardados aqui: ${context.output}`);

	//
	// Request the export types and which filters to apply

	const exportTypes = await promptExportTypes();

	const filterTypes = await promptFilterTypes();

	//
	// For the selected filters, request the filter values

	if (filterTypes.includes('agency-ids')) context.filters.agency_ids = await promptFilterByAgencyIds();
	if (filterTypes.includes('line-ids')) context.filters.line_ids = await promptFilterByLineIds();
	if (filterTypes.includes('pattern-ids')) context.filters.pattern_ids = await promptFilterByPatternIds();
	if (filterTypes.includes('stop-ids')) context.filters.stop_ids = await promptFilterByStopIds();
	if (filterTypes.includes('vehicle-ids')) context.filters.vehicle_ids = await promptFilterByVehicleIds();

	context.dates = await promptFilterByDates();

	//
	// Build the tasks array for the selected export types

	await tasks([

		{
			enabled: exportTypes.includes('validations-raw'),
			task: async message => await exportValidationsRaw({ context, message }),
			title: availableExportTypesLabels['validations-raw'],
		},

		{
			enabled: exportTypes.includes('validations-by-pattern'),
			task: async message => await exportValidationsRaw({ context, message }),
			title: availableExportTypesLabels['validations-by-pattern'],
		},

	]);

	//
	// Terminate the process

	outro('Exportação terminada.');

	process.exit(0);

	//
})().catch(console.error);
