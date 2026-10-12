import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Typology } from '@tmlmobilidade/go-types-offer';

/**
 * Fetches typologies filtered by agency IDs
 * @param agencyIds - The agency IDs to filter by
 * @returns An array of typologies
 */
export async function fetchTypologiesByAgencyIds(agencyIds: string[]): Promise<Typology[]> {
	try {
		if (!agencyIds.length) return [];
		return await goDb.offer.typologies.findMany({ agency_ids: { $in: agencyIds } });
	} catch (error) {
		throw new Error(`Error fetching typologies by agency IDs: ${error}`, error);
	}
}

/**
 * Gets typology details from a pre-fetched map or fetches it individually
 * @param typologyId - The typology ID to fetch
 * @param typologiesMap - Optional pre-fetched map of typologies
 * @returns The typology data or null if not found
 */
export async function getTypologyDetails(
	typologyId: null | string,
	typologiesMap?: Map<string, Typology>,
): Promise<null | Typology> {
	if (!typologyId) return null;

	// If we have a pre-fetched map, use it
	if (typologiesMap) {
		return typologiesMap.get(typologyId) || null;
	}

	// Otherwise, fetch individually
	try {
		return await goDb.offer.typologies.findById(typologyId);
	} catch (error) {
		throw new Error(`Error fetching typology ${typologyId}: ${error}`, error);
	}
}
