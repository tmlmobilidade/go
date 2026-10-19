/**
 * Enforces the qualified trip ID format.
 * @param planId The ID of the plan this trip belongs to.
 * @param agencyId The ID of the agency this trip belongs to.
 * @param tripId The ID of the trip.
 * @returns The qualified trip ID.
 */
export function getQualifiedTripId(planId: string, agencyId: string, tripId: string): string {
	// Validate that the plan ID is a non-empty string
	if (typeof planId !== 'string' || !planId.trim()) {
		throw new Error('Invalid plan ID: must be a non-empty string.');
	}
	// Validate that the agency ID is a non-empty string
	if (typeof agencyId !== 'string' || !agencyId.trim()) {
		throw new Error('Invalid agency ID: must be a non-empty string.');
	}
	// Validate that the trip ID is a non-empty string
	if (typeof tripId !== 'string' || !tripId.trim()) {
		throw new Error('Invalid trip ID: must be a non-empty string.');
	}
	// Construct the qualified trip ID using a consistent format
	return `[${planId}][${agencyId}]${tripId}`;
}
