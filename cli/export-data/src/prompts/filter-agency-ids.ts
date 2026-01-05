/* * */

import { note, text } from '@clack/prompts';

/* * */

export async function promptFilterByAgencyIds(): Promise<string[]> {
	//

	note(
		'FILTRAR POR AGENCY ID:\n'
		+ '  • Introduz os Agency IDs separados por vírgulas. Exemplo: 41,42,etc...\n'
		+ '  • Se não introduzires nenhum Agency ID, este filtro não será aplicado.',
	);

	const value = await text({
		message: 'Agency IDs:',
		placeholder: '41,42,etc...',
		validate(value) {
			if (value.length === 0) return;
			const ids = value.replace(/,$/, '').split(',').map(id => id.trim());
			const invalidIds = ids.filter(id => !/^\d{2}$/.test(id));
			if (invalidIds.length > 0) return `Estes IDs são inválidos: ${invalidIds.join(', ')}`;
			return;
		},
	});

	if (!value) return [];

	return (value as string).split(',').map(id => id.trim());
}
