/* * */

import { note, text } from '@clack/prompts';

/* * */

export async function promptHashedShapeIds(): Promise<string[]> {
	//

	note(
		'EXPORTAR HASHED SHAPES PARA GEOJSON:\n'
		+ '  • Introduz os HashedShape IDs separados por vírgulas. Exemplo: id1,id2,etc...\n'
		+ '  • Todos os IDs serão exportados para um ficheiro GeoJSON.',
	);

	const value = await text({
		message: 'HashedShape IDs:',
		placeholder: 'id1,id2,etc...',
		validate(value) {
			if (!value || value.trim().length === 0) {
				return 'É necessário introduzir pelo menos um HashedShape ID.';
			}
			return;
		},
	});

	if (!value) return [];

	return (value as string).split(',').map(id => id.trim()).filter(id => id.length > 0);
}
