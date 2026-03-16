/**
 * Gets the public trip ID for a given plan ID and trip ID.
 * @param planId The ID of the plan this trip belongs to.
 * @param tripId The ID of the trip.
 * @returns The public trip ID.
 */
export function getPublicTripId(planId: string, tripId: string): string {
	// Validate that the plan ID is a non-empty string
	if (typeof planId !== 'string' || !planId.trim()) {
		throw new Error('Invalid plan ID: must be a non-empty string.');
	}
	// Validate that the trip ID is a non-empty string
	if (typeof tripId !== 'string' || !tripId.trim()) {
		throw new Error('Invalid trip ID: must be a non-empty string.');
	}
	// Construct the public trip ID using a consistent format
	return `[${planId}]${tripId}`;
}
