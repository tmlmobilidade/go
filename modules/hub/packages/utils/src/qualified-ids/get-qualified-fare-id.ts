/**
 * Enforces the qualified fare ID format.
 * @param agencyId The ID of the agency this fare belongs to.
 * @param fareId The ID of the fare.
 * @returns The qualified fare ID.
 */
export function getQualifiedFareId(agencyId: string, fareId: string): string {
	// Validate that the agency ID is a non-empty string
	if (typeof agencyId !== 'string' || !agencyId.trim()) {
		throw new Error('Invalid agency ID: must be a non-empty string.');
	}
	// Validate that the fare ID is a non-empty string
	if (typeof fareId !== 'string' || !fareId.trim()) {
		throw new Error('Invalid fare ID: must be a non-empty string.');
	}
	// Construct the qualified fare ID using a consistent format
	return `[${agencyId}]${fareId}`;
}
