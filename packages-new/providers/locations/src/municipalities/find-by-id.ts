/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Municipality } from '@tmlmobilidade/go-types-locations';

/* * */

export interface FindByIdOptions {
	geometry?: boolean
}

/**
 * Finds a municipality by its identifier.
 * @param id - Municipality identifier.
 * @param options - Optional query options.
 * @returns The municipality, or null if not found.
 */
export async function findById(id: string, { geometry = false }: FindByIdOptions = {}): Promise<Municipality | null> {
	const municipality = await goDb.locations.municipalities.findOne({ _id: id });
	if (!municipality) return null;
	return {
		_id: municipality._id,
		...municipality.properties,
		...(geometry ? { geometry: municipality.geometry } : {}),
	};
}
