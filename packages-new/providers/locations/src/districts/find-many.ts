/* * */

import { flattenPropertiesPipeline } from '@/utils/flatten-properties-pipeline.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type District } from '@tmlmobilidade/go-types-locations';

/* * */

export interface FindManyInput {
	districtIds?: string[]
}

/**
 * Lists districts, optionally filtered by district identifiers.
 * @param input - Optional filter criteria.
 * @returns Districts sorted by identifier.
 */
export async function findMany({ districtIds }: FindManyInput = {}): Promise<District[]> {
	return await goDb.locations.districts.aggregate([
		{ $match: {
			...(districtIds ? { 'properties.district_id': { $in: districtIds } } : {}),
		} },
		...flattenPropertiesPipeline() as never[],
	]) as unknown as District[];
}
