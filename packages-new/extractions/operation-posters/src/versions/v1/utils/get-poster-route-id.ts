/* * */

/**
 * Get the poster route ID from a given route ID.
 * @param routeId - The route ID to get the poster route ID for.
 * @returns The poster route ID.
 */
export function getPosterRouteId(routeId: string): string {
	//

	//
	// A. Remove the trailing numeric variant suffix from the source route ID

	return routeId.replace(/_\d+$/, '');
}
