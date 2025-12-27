/* * */

import { log, text } from '@clack/prompts';

/* * */

export async function promptFilterByStopIds(): Promise<string[]> {
	//

	log.step('FILTRAR POR STOP ID:');

	log.message('- Introduz os Stop IDs separados por vírgulas. Exemplo: 010101,020202,etc...');
	log.message('- Não te esqueças do zero à esquerda.');
	log.message('- Se não introduzires nenhum Stop ID, este filtro não será aplicado.');

	const stopIds = await text({
		message: 'Stop IDs:',
		placeholder: '010101,020202,etc...',
		validate(value) {
			if (value.length === 0) return;
			const ids = value.replace(/,$/, '').split(',').map(id => id.trim());
			const invalidIds = ids.filter(id => !/^\d{6}$/.test(id));
			if (invalidIds.length > 0) return `Estes IDs são inválidos: ${invalidIds.join(', ')}`;
			return;
		},
	});

	if (!stopIds) return [];

	return (stopIds as string).split(',').map(id => id.trim());
}
