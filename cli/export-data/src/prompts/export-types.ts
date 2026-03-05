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
				{ label: exportTypeLabels['validations-aggregated'], value: 'validations-aggregated' },
			],
			'2. Rides': [
				{ label: exportTypeLabels['rides-raw'], value: 'rides-raw' },
			],
			'3. Vehicle Events': [
				{ label: exportTypeLabels['vehicle-events-raw'], value: 'vehicle-events-raw' },
			],
			'4. HashedShapes': [
				{ label: exportTypeLabels['hashed-shapes-geojson'], value: 'hashed-shapes-geojson' },
			],
			'5. SAMs': [
				{ label: exportTypeLabels['sams-raw'], value: 'sams-raw' },
			],
			'6. Sumário Executivo': [
				{ label: exportTypeLabels['executive-summary'], value: 'executive-summary' },
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
