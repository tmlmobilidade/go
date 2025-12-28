/* * */

import { groupMultiselect } from '@clack/prompts';

/* * */

export const availableExportTypesLabels = {
	'rides-raw': '2.0. Rides em bruto (SLAs)',
	'validations-by-line': '1.5. Validações por Line ID',
	'validations-by-pattern': '1.4. Validações por Pattern ID',
	'validations-by-stop': '1.3. Validações por Stop ID',
	'validations-by-stop-by-pattern': '1.2. Validações por Stop ID, por Pattern ID',
	'validations-by-stop-by-trip': '1.1. Validações por Stop ID, por Trip ID',
	'validations-raw': '1.0. Validações em bruto',
	'vehicle-events-raw': '3.0. Vehicle Events em bruto',
} as const;

/* * */

export async function promptExportTypes(): Promise<(keyof typeof availableExportTypesLabels)[]> {
	//

	const values = await groupMultiselect({
		message: 'Escolhe os dados que queres exportar:',
		options: {
			'1. Validações APEX': [
				{ label: availableExportTypesLabels['validations-raw'], value: 'validations-raw' },
				{ label: availableExportTypesLabels['validations-by-stop-by-trip'], value: 'validations-by-stop-by-trip' },
				{ label: availableExportTypesLabels['validations-by-stop-by-pattern'], value: 'validations-by-stop-by-pattern' },
				{ label: availableExportTypesLabels['validations-by-stop'], value: 'validations-by-stop' },
				{ label: availableExportTypesLabels['validations-by-pattern'], value: 'validations-by-pattern' },
				{ label: availableExportTypesLabels['validations-by-line'], value: 'validations-by-line' },
			],
			'2. Rides': [
				{ label: availableExportTypesLabels['rides-raw'], value: 'rides-raw' },
			],
			'3. Vehicle Events': [
				{ label: availableExportTypesLabels['vehicle-events-raw'], value: 'vehicle-events-raw' },
			],
		},
		required: true,
	});

	if (!values) return [];

	return values as (keyof typeof availableExportTypesLabels)[];
}
