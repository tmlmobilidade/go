/* * */

import { note, text } from '@clack/prompts';

/* * */

export async function promptFilterByVehicleIds(): Promise<number[]> {
	//

	note(
		'FILTRAR POR VEHICLE ID:\n'
		+ '  • Introduz os Vehicle IDs separados por vírgulas. Exemplo: 1234,9876,etc...\n'
		+ '  • Se não introduzires nenhum Vehicle ID, este filtro não será aplicado.',
	);

	const value = await text({
		message: 'Vehicle IDs:',
		placeholder: '1234,9876,etc...',
		validate(value) {
			if (value.length === 0) return;
			const ids = value.replace(/,$/, '').split(',').map(id => id.trim());
			const invalidIds = ids.filter(id => !/^\d+$/.test(id));
			if (invalidIds.length > 0) return `Estes IDs são inválidos: ${invalidIds.join(', ')}`;
			return;
		},
	});

	if (!value) return [];

	return (value as string).split(',').map(id => Number(id.trim()));
}
