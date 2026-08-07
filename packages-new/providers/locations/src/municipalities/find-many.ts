/* * */

import { flattenPropertiesPipeline } from '@/utils/flatten-properties-pipeline.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Municipality } from '@tmlmobilidade/types';

/* * */

export interface FindManyInput {
	districtIds?: string[]
}

/**
 * Lists municipalities, optionally filtered by district identifiers.
 * @param input - Optional filter criteria.
 * @returns Municipalities sorted by identifier.
 */
export async function findMany({ districtIds }: FindManyInput = {}): Promise<Municipality[]> {
	return await goDb.locations.municipalities.aggregate([
		{ $match: {
			...(districtIds ? { 'properties.district_id': { $in: districtIds } } : {}),
		} },
		...flattenPropertiesPipeline() as never[],
	]) as unknown as Municipality[];
}
