/* * */

import { flattenPropertiesPipeline } from '@/utils/flatten-properties-pipeline.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Parish } from '@tmlmobilidade/types';

/* * */

export interface FindManyInput {
	districtIds?: string[]
	municipalityIds?: string[]
	parishIds?: string[]
}

/**
 * Lists parishes, optionally filtered by district or municipality identifiers.
 * @param input - Optional filter criteria.
 * @returns Parishes sorted by identifier.
 */
export async function findMany({ districtIds, municipalityIds }: FindManyInput = {}): Promise<Parish[]> {
	return await goDb.locations.parishes.aggregate([
		{ $match: {
			...(districtIds ? { 'properties.district_id': { $in: districtIds } } : {}),
			...(municipalityIds ? { 'properties.municipality_id': { $in: municipalityIds } } : {}),
		} },
		...flattenPropertiesPipeline() as never[],
	]) as unknown as Parish[];
}
