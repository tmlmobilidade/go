/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Locality } from '@tmlmobilidade/go-types-locations';

/* * */

export interface FindByIdOptions {
	geometry?: boolean
}

/**
 * Finds a locality by its identifier.
 * @param id - Locality identifier.
 * @param options - Optional query options.
 * @returns The locality, or null if not found.
 */
export async function findById(id: string, { geometry = false }: FindByIdOptions = {}): Promise<Locality | null> {
	const locality = await goDb.locations.localities.findOne({ _id: id });
	if (!locality) return null;
	return {
		_id: locality._id,
		...locality.properties,
		...(geometry ? { geometry: locality.geometry } : {}),
	};
}
