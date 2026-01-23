/* * */

import { type ValidationGroupField, validationGroupFieldLabels, validationGroupFields } from '@/tasks/apex-validations/validations-aggregated.js';
import { cancel, isCancel, multiselect } from '@clack/prompts';

/* * */

export async function promptValidationGroupFields(): Promise<ValidationGroupField[]> {
	//

	const values = await multiselect({
		message: 'Escolhe os campos para agrupar as validações (a data é sempre incluída):',
		options: validationGroupFields.map(field => ({
			label: validationGroupFieldLabels[field],
			value: field,
		})),
		required: true,
	});

	if (isCancel(values)) {
		cancel('Operação cancelada pelo utilizador.');
		process.exit(0);
	}

	if (!values) return [];

	return values as ValidationGroupField[];
}
