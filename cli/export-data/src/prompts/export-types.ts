/* * */

import { type ExportType, exportTypeLabels } from '@/types.js';
import { cancel, groupMultiselect, isCancel } from '@clack/prompts';

/* * */

export async function promptExportTypes(): Promise<ExportType[]> {
	//

	const values = await groupMultiselect({
		message: 'Escolhe os dados que queres exportar:',
		options: {
			'1. Validações APEX': [
				{ label: exportTypeLabels['validations-raw'], value: 'validations-raw' },
				{ label: exportTypeLabels['validations-by-stop-by-trip'], value: 'validations-by-stop-by-trip' },
				{ label: exportTypeLabels['validations-by-stop-by-pattern'], value: 'validations-by-stop-by-pattern' },
				{ label: exportTypeLabels['validations-by-stop'], value: 'validations-by-stop' },
				{ label: exportTypeLabels['validations-by-pattern'], value: 'validations-by-pattern' },
				{ label: exportTypeLabels['validations-by-line'], value: 'validations-by-line' },
			],
			'2. Rides': [
				{ label: exportTypeLabels['rides-raw'], value: 'rides-raw' },
			],
			'3. Vehicle Events': [
				{ label: exportTypeLabels['vehicle-events-raw'], value: 'vehicle-events-raw' },
			],
		},
		required: true,
	});

	if (isCancel(values)) {
		cancel('Operação cancelada pelo utilizador.');
		process.exit(0);
	}

	if (!values) return [];

	return values as ExportType[];
}
