/* * */

import { multiselect } from '@clack/prompts';

/* * */

export async function promptFilterTypes(): Promise<string[]> {
	//

	const values = await multiselect({
		message: 'Escolhe os filtros que queres aplicar:',
		options: [
			{ label: 'Stop IDs', value: 'stop-ids' },
			{ label: 'Line IDs', value: 'line-ids' },
			{ label: 'Pattern IDs', value: 'pattern-ids' },
		],
		required: false,
	});

	if (!values) return [];

	return values as string[];
}
