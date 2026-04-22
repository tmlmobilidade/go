/* * */

import { cancel, isCancel, note, text } from '@clack/prompts';
import { type OperationalDate, validateOperationalDate } from '@tmlmobilidade/types';

/* * */

export async function promptFilterByDates(): Promise<{ end: OperationalDate, start: OperationalDate }> {
	//

	note(
		'FILTRAR POR DATAS:\n'
		+ '  • Introduz as datas operacionais no formato ano-mês-dia. Exemplo: 20250101 ou 2025-01-01\n'
		+ '  • Devido ao enorme volume de dados, filtrar por datas é obrigatório.\n'
		+ '  • A data de início não pode ser anterior a 1 Jan. 2024 (20240101).',
	);

	const startDate = await text({
		initialValue: '',
		message: 'Data de Início:',
		placeholder: '20240101 ou 2024-01-01',
		validate(value) {
			try {
				if (value.length === 0) return 'A data de início é obrigatória.';
				const formattedValue = formatOperationalDateInput(value);
				validateOperationalDate(formattedValue);
				if (Number(formattedValue) < 20240101) return 'A data de início não pode ser anterior a 2024-01-01.';
				if (Number(formattedValue) > 20291231) return 'A data de início não pode ser posterior a 2029-12-31.';
			} catch (error) {
				return error.message;
			}
		},
	});

	if (isCancel(startDate)) {
		cancel('Operação cancelada pelo utilizador.');
		process.exit(0);
	}

	const endDate = await text({
		initialValue: '',
		message: 'Data de Fim:',
		placeholder: '20240101 ou 2024-01-01',
		validate(value) {
			try {
				if (value.length === 0) return 'A data de fim é obrigatória.';
				const formattedValue = formatOperationalDateInput(value);
				validateOperationalDate(formattedValue);
				if (Number(formattedValue) < Number(startDate)) return 'A data de fim não pode ser anterior à data de início.';
				if (Number(formattedValue) > 20291231) return 'A data de fim não pode ser posterior a 2029-12-31.';
			} catch (error) {
				return error.message;
			}
		},
	});

	if (isCancel(startDate)) {
		cancel('Operação cancelada pelo utilizador.');
		process.exit(0);
	}

	return {
		end: validateOperationalDate(formatOperationalDateInput(endDate as string)),
		start: validateOperationalDate(formatOperationalDateInput(startDate as string)),
	};
}

/**
 * This function formats the operational date
 * string input by removing all non-numeric characters.
 * @param value The input string representing an operational date.
 * @returns The formatted operational date string containing only numeric characters.
 */
function formatOperationalDateInput(value: string): string {
	// Remove all characters that are not numbers
	return value.replaceAll(/[^0-9]/g, '');
}
