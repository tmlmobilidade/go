/* * */

/**
 * Utility function to keep URL parameters when navigating to a new destination.
 * This function appends the provided search parameters to the destination URL.
 * @param destination The base URL to which the search parameters will be appended.
 * @param searchParams The search parameters to append. You can get this with `window.location.search`.
 * @returns A new URL string that combines the destination and the search parameters.
 */
export function keepUrlParams(destination: string, searchParams?: string): string {
	if (!searchParams) return destination;
	return `${destination}${searchParams}`;
}
