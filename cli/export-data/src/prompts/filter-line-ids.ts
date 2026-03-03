/* * */

import { parseIdListWithRanges, validateIdListWithRanges } from '@/utils/parse-id-list.js';
import { note, text } from '@clack/prompts';

/* * */

const DIGITS = 4 as const;

export async function promptFilterByLineIds(): Promise<string[]> {
	//

	note(
		'FILTRAR POR LINE ID:\n'
		+ '  • Introduz os Line IDs separados por vírgulas. Exemplo: 1001,1002,etc...\n'
		+ '  • Introduz o intervalo de Line IDs. Exemplo: 1001-1002\n'
		+ '  • Ambos os formatos podem ser introduzidos juntos. Exemplo: 1001-1002,1003,1004\n'
		+ '  • Se não introduzires nenhum Line ID, este filtro não será aplicado.',
	);

	const value = await text({
		message: 'Line IDs:',
		placeholder: '1001-1004 ou 1001,1002,...',
		validate: v => (v.length ? validateIdListWithRanges(v, DIGITS) : undefined),
	});

	return value ? parseIdListWithRanges(String(value), DIGITS) : [];
}
