/* * */

import { flattenPropertiesPipeline } from '@/utils/flatten-properties-pipeline.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Locality } from '@tmlmobilidade/types';

/* * */

export interface FindManyInput {
	districtIds?: string[]
	municipalityIds?: string[]
	parishIds?: string[]
}

/**
 * Lists localities, optionally filtered by district, municipality, or parish identifiers.
 * @param input - Optional filter criteria.
 * @returns Localities sorted by identifier.
 */
export async function findMany({ districtIds, municipalityIds, parishIds }: FindManyInput = {}): Promise<Locality[]> {
	return await goDb.locations.localities.aggregate([
		{ $match: {
			...(districtIds ? { 'properties.district_id': { $in: districtIds } } : {}),
			...(municipalityIds ? { 'properties.municipality_id': { $in: municipalityIds } } : {}),
			...(parishIds ? { 'properties.parish_id': { $in: parishIds } } : {}),
		} },
		...flattenPropertiesPipeline() as never[],
	]) as unknown as Locality[];
}
