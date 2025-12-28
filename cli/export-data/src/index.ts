#!/usr/bin/env node

import { availableExportTypesLabels, promptExportTypes } from '@/prompts/export-types.js';
import { promptFilterByLineIds } from '@/prompts/filter-line-ids.js';
import { promptFilterByPatternIds } from '@/prompts/filter-pattern-ids.js';
import { promptFilterByStopIds } from '@/prompts/filter-stop-ids.js';
import { promptFilterTypes } from '@/prompts/filter-types.js';
import { exportValidationsRaw } from '@/tasks/apex-validations/validations-raw.js';
import { type FilterValues } from '@/types/init.js';
import { tasks } from '@clack/prompts';

/* * */

(async function main() {
	//

	//
	// Request the export types and which filters to apply

	const exportTypes = await promptExportTypes();

	const filterTypes = await promptFilterTypes();

	//
	// For the selected filters, request the filter values

	const filterValues: FilterValues = {
		line_ids: [],
		pattern_ids: [],
		stop_ids: [],
	};

	if (filterTypes.includes('stop-ids')) filterValues.stop_ids = await promptFilterByStopIds();
	if (filterTypes.includes('line-ids')) filterValues.line_ids = await promptFilterByLineIds();
	if (filterTypes.includes('pattern-ids')) filterValues.pattern_ids = await promptFilterByPatternIds();

	//
	// Build the tasks array for the selected export types

	await tasks([

		{
			enabled: exportTypes.includes('validations-raw'),
			task: async message => await exportValidationsRaw({ filter_values: filterValues, message }),
			title: availableExportTypesLabels['validations-raw'],
		},

		{
			enabled: exportTypes.includes('validations-by-pattern'),
			task: async message => await exportValidationsRaw({ filter_values: filterValues, message }),
			title: availableExportTypesLabels['validations-by-pattern'],
		},

	]);

	//
})().catch(console.error);
