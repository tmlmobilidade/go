/* * */

import { log, text } from '@clack/prompts';

/* * */

export async function promptFilterByPatternIds(): Promise<string[]> {
	//

	log.step('FILTRAR POR PATTERN ID:');

	log.message('- Introduz os Pattern IDs separados por vírgulas. Exemplo: 1001_0_1,1001_0_2,etc...');
	log.message('- Se não introduzires nenhum Pattern ID, este filtro não será aplicado.');

	const patternIds = await text({
		message: 'Pattern IDs:',
		placeholder: '1001_0_1,1001_0_2,etc...',
		validate(value) {
			if (value.length === 0) return;
			const ids = value.replace(/,$/, '').split(',').map(id => id.trim());
			const invalidIds = ids.filter(id => !/^\d{4}_\d_\d$/.test(id));
			if (invalidIds.length > 0) return `Estes IDs são inválidos: ${invalidIds.join(', ')}`;
			return;
		},
	});

	if (!patternIds) return [];

	return (patternIds as string).split(',').map(id => id.trim());
}
