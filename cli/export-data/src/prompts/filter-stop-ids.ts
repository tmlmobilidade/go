/* * */

import { parseIdListWithRanges, validateIdListWithRanges } from '@/utils/parse-id-list.js';
import { note, text } from '@clack/prompts';

/* * */

const DIGITS = 6 as const;

export async function promptFilterByStopIds(): Promise<string[]> {
	//

	note(
		'FILTRAR POR STOP ID:\n'
		+ '  • Introduz os Stop IDs separados por vírgulas. Exemplo: 010101,020202,etc...\n'
		+ '  • Introduz o intervalo de Stop IDs. Exemplo: 01001-01002\n'
		+ '  • Não te esqueças do zero à esquerda.\n'
		+ '  • Se não introduzires nenhum Stop ID, este filtro não será aplicado.',
	);

	const value = await text({
		message: 'Stop IDs:',
		placeholder: '010001-010004 ou 010101,020202,...',
		validate: v => (v.length ? validateIdListWithRanges(v, DIGITS) : undefined),
	});

	return value ? parseIdListWithRanges(String(value), DIGITS) : [];
}
