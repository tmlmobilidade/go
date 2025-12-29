/* * */

import { note, text } from '@clack/prompts';

/* * */

export async function promptFilterByStopIds(): Promise<string[]> {
	//

	note(
		'FILTRAR POR STOP ID:\n'
		+ '  • Introduz os Stop IDs separados por vírgulas. Exemplo: 010101,020202,etc...\n'
		+ '  • Não te esqueças do zero à esquerda.\n'
		+ '  • Se não introduzires nenhum Stop ID, este filtro não será aplicado.',
	);

	const value = await text({
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

	if (!value) return [];

	return (value as string).split(',').map(id => id.trim());
}
