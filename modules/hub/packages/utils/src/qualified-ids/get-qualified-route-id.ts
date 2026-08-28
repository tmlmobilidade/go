/**
 * Enforces the qualified route ID format.
 * @param agencyId The ID of the agency this route belongs to.
 * @param routeId The ID of the route.
 * @returns The qualified route ID.
 */
export function getQualifiedRouteId(agencyId: string, routeId: string): string {
	// Validate that the agency ID is a non-empty string
	if (typeof agencyId !== 'string' || !agencyId.trim()) {
		throw new Error('Invalid agency ID: must be a non-empty string.');
	}
	// Validate that the route ID is a non-empty string
	if (typeof routeId !== 'string' || !routeId.trim()) {
		throw new Error('Invalid route ID: must be a non-empty string.');
	}
	// Construct the qualified route ID using a consistent format
	return `[${agencyId}]${routeId}`;
}
