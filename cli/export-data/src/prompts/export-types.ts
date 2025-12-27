/* * */

import { groupMultiselect } from '@clack/prompts';

/* * */

export async function promptExportTypes(): Promise<string[]> {
	//

	const values = await groupMultiselect({
		message: 'Escolhe os dados que queres exportar:',
		options: {
			'1. Validações APEX': [
				{ label: '1.0. Validações em bruto', value: 'validations-raw' },
				{ label: '1.1. Validações por Stop ID, por Trip ID', value: 'validations-by-stop-by-trip' },
				{ label: '1.2. Validações por Stop ID, por Pattern ID', value: 'validations-by-stop-by-pattern' },
				{ label: '1.3. Validações por Stop ID', value: 'validations-by-stop' },
				{ label: '1.4. Validações por Pattern ID', value: 'validations-by-pattern' },
				{ label: '1.5. Validações por Line ID', value: 'validations-by-line' },
			],
			'2. Rides': [
				{ label: '2.0. Rides em bruto (SLAs)', value: 'rides-raw' },
			],
			'3. Vehicle Events': [
				{ label: '3.0. Vehicle Events em bruto', value: 'vehicle-events-raw' },
			],
		},
		required: true,
	});

	return values as string[];
}
