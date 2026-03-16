import { typologies } from '@tmlmobilidade/interfaces';
import { Typology } from '@tmlmobilidade/types';

/**
 * Fetches all typologies and returns them as a Map keyed by ID
 * @returns A Map of typology ID to Typology object
 */
export async function fetchAllTypologies(): Promise<Map<string, Typology>> {
	try {
		const allTypologies = await typologies.findMany({});
		const typologiesMap = new Map<string, Typology>();
		for (const typology of allTypologies) {
			typologiesMap.set(typology._id, typology);
		}
		return typologiesMap;
	}
	catch (error) {
		throw new Error(`Error fetching typologies: ${error}`);
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
		return await typologies.findById(typologyId);
	}
	catch (error) {
		throw new Error(`Error fetching typology ${typologyId}: ${error}`);
	}
}
