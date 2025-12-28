/* * */

import { type TaskProps } from '@/types/init.js';

/**
 * Export Validations Raw data applying the given filters.
 */
export async function exportValidationsRaw(props: TaskProps): Promise<void> {
	props.message('Iniciando exportação de Validations Raw...');
	await new Promise(resolve => setTimeout(resolve, 10000));
	props.message('Fazendo outra coisa...');
	await new Promise(resolve => setTimeout(resolve, 10000));
	props.message('Exportação de Validations Raw concluída.');
}
