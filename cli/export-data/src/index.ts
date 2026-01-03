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
import { exportValidationsByLine } from '@/tasks/apex-validations/validations-by-line.js';
import { exportValidationsByPattern } from '@/tasks/apex-validations/validations-by-pattern.js';
import { exportValidationsByStopByPattern } from '@/tasks/apex-validations/validations-by-stop-by-pattern.js';
import { exportValidationsByStopByTrip } from '@/tasks/apex-validations/validations-by-stop-by-trip.js';
import { exportValidationsByStop } from '@/tasks/apex-validations/validations-by-stop.js';
import { exportValidationsRaw } from '@/tasks/apex-validations/validations-raw.js';
import { exportRidesRaw } from '@/tasks/rides/rides-raw.js';
import { exportVehicleEventsRaw } from '@/tasks/vehicle-events/vehicle-events-raw.js';
import { exportTypeLabels } from '@/types.js';
import { initExportContext } from '@/utils/init-context.js';
import { intro, log, outro, tasks } from '@clack/prompts';
import { ASCII_CM_SHORT } from '@tmlmobilidade/consts';

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
	// Prompt for the access key

	await promptAccessKey();

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
			title: exportTypeLabels['validations-raw'],
		},

		{
			enabled: exportTypes.includes('validations-by-stop-by-trip'),
			task: async message => await exportValidationsByStopByTrip({ context, message }),
			title: exportTypeLabels['validations-by-stop-by-trip'],
		},

		{
			enabled: exportTypes.includes('validations-by-stop-by-pattern'),
			task: async message => await exportValidationsByStopByPattern({ context, message }),
			title: exportTypeLabels['validations-by-stop-by-pattern'],
		},

		{
			enabled: exportTypes.includes('validations-by-stop'),
			task: async message => await exportValidationsByStop({ context, message }),
			title: exportTypeLabels['validations-by-stop'],
		},

		{
			enabled: exportTypes.includes('validations-by-pattern'),
			task: async message => await exportValidationsByPattern({ context, message }),
			title: exportTypeLabels['validations-by-pattern'],
		},

		{
			enabled: exportTypes.includes('validations-by-line'),
			task: async message => await exportValidationsByLine({ context, message }),
			title: exportTypeLabels['validations-by-line'],
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

	]);

	//
	// Terminate the process

	outro('Exportação terminada.');

	process.exit(0);

	//
})().catch(console.error);
