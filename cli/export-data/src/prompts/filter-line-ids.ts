/* * */

import { log, text } from '@clack/prompts';

/* * */

export async function promptFilterByLineIds(): Promise<string[]> {
	//

	log.step('FILTRAR POR LINE ID:');

	log.message('- Introduz os Line IDs separados por vírgulas. Exemplo: 1001,1002,etc...');
	log.message('- Se não introduzires nenhum Line ID, este filtro não será aplicado.');

	const value = await text({
		message: 'Line IDs:',
		placeholder: '1001,1002,etc...',
		validate(value) {
			if (value.length === 0) return;
			const ids = value.replace(/,$/, '').split(',').map(id => id.trim());
			const invalidIds = ids.filter(id => !/^\d{4}$/.test(id));
			if (invalidIds.length > 0) return `Estes IDs são inválidos: ${invalidIds.join(', ')}`;
			return;
		},
	});

	if (!value) return [];

	return (value as string).split(',').map(id => id.trim());
}
