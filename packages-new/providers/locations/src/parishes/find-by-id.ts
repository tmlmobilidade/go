/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Parish } from '@tmlmobilidade/types';

/* * */

export interface FindByIdOptions {
	geometry?: boolean
}

/**
 * Finds a parish by its identifier.
 * @param id - Parish identifier.
 * @param options - Optional query options.
 * @returns The parish, or null if not found.
 */
export async function findById(id: string, { geometry = false }: FindByIdOptions = {}): Promise<null | Parish> {
	const parish = await goDb.locations.parishes.findOne({ _id: id });
	if (!parish) return null;
	return {
		_id: parish._id,
		...parish.properties,
		...(geometry ? { geometry: parish.geometry } : {}),
	};
}
