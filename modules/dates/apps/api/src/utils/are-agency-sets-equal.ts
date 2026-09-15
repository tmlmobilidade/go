/* * */

/**
 * Checks if two agency ID arrays contain exactly the same IDs, regardless of order.
 * @param agencyIdsA The first array of agency IDs
 * @param agencyIdsB The second array of agency IDs
 * @returns True if both arrays contain the same agency IDs
 */
export function areAgencySetsEqual(agencyIdsA: string[], agencyIdsB: string[]): boolean {
	if (agencyIdsA.length !== agencyIdsB.length) return false;
	const sortedA = [...agencyIdsA].sort();
	const sortedB = [...agencyIdsB].sort();
	return sortedA.every((id, index) => id === sortedB[index]);
}
