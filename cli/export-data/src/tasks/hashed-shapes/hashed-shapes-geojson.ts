/* * */

import { type ExportType, type TaskProps } from '@/types.js';
import { hashedShapesToFeatureCollection } from '@/utils/hashed-shapes-to-geojson.js';
import { hashedShapes } from '@tmlmobilidade/interfaces';
import { type HashedShape } from '@tmlmobilidade/types';
import fs from 'node:fs';

/* * */

const TASK_ID: ExportType = 'hashed-shapes-geojson';

/* * */

export async function exportHashedShapesGeoJSON({ context, hashedShapeIds, message }: TaskProps & { hashedShapeIds: string[] }): Promise<void> {
	//

	message('A iniciar a exportação de HashedShapes para GeoJSON...');

	//
	// Fetch all hashed_shapes by their IDs

	message(`A procurar ${hashedShapeIds.length} HashedShape(s) na base de dados...`);

	const foundHashedShapes: HashedShape[] = [];
	const notFoundIds: string[] = [];

	for (const id of hashedShapeIds) {
		const hashedShape = await hashedShapes.findById(id);
		if (hashedShape) {
			foundHashedShapes.push(hashedShape);
		} else {
			notFoundIds.push(id);
		}
	}

	if (notFoundIds.length > 0) {
		message(`Aviso: ${notFoundIds.length} HashedShape(s) não foram encontrados: ${notFoundIds.join(', ')}`);
	}

	if (foundHashedShapes.length === 0) {
		message('Erro: Nenhum HashedShape foi encontrado.');
		return;
	}

	message(`Encontrados ${foundHashedShapes.length} HashedShape(s).`);

	//
	// Convert to GeoJSON FeatureCollection

	message('A converter para GeoJSON...');

	const featureCollection = hashedShapesToFeatureCollection(foundHashedShapes);

	//
	// Prepare the output directory

	message(`A preparar a pasta para guardar os resultados...`);

	if (!fs.existsSync(context.output)) fs.mkdirSync(context.output, { recursive: true });

	//
	// Write the GeoJSON file

	const outputFileName = `${context.output}/${TASK_ID}-${hashedShapeIds.join('-')}.geojson`;

	message(`A escrever o ficheiro GeoJSON: ${outputFileName}`);

	fs.writeFileSync(outputFileName, JSON.stringify(featureCollection, null, 2), 'utf-8');

	message(`Exportação concluída! Ficheiro guardado em: ${outputFileName}`);

	//
}
