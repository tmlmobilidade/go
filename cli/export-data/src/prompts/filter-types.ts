/* * */

import { multiselect } from '@clack/prompts';

/* * */

export async function promptFilterTypes(): Promise<string[]> {
	//

	const values = await multiselect({
		message: 'Escolhe os filtros que queres aplicar:',
		options: [
			{ label: 'Operador (agency_id)', value: 'agency-ids' },
			{ label: 'Paragem (stop_id)', value: 'stop-ids' },
			{ label: 'Linha (line_id)', value: 'line-ids' },
			{ label: 'Pattern (pattern_id)', value: 'pattern-ids' },
			{ label: 'Veículo (vehicle_id)', value: 'vehicle-ids' },
		],
		required: false,
	});

	if (!values) return [];

	return values as string[];
}
