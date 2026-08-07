/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type District } from '@tmlmobilidade/types';

/* * */

export interface FindByIdOptions {
	geometry?: boolean
}

/**
 * Finds a district by its identifier.
 * @param id - District identifier.
 * @param options - Optional query options.
 * @returns The district, or null if not found.
 */
export async function findById(id: string, { geometry = false }: FindByIdOptions = {}): Promise<District | null> {
	const district = await goDb.locations.districts.findOne({ _id: id });
	if (!district) return null;
	return {
		_id: district._id,
		...district.properties,
		...(geometry ? { geometry: district.geometry } : {}),
	};
}
