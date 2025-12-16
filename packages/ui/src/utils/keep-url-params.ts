'use client';

/**
 * Utility function to keep URL parameters when navigating to a new destination.
 * This function appends the provided search parameters to the destination URL.
 * By default, it uses the current window's search parameters: `window.location.search`.
 * @param destination The base URL to which the search parameters will be appended.
 * @returns A new URL string that combines the destination and the search parameters.
 */
export function keepUrlParams(destination: string): string {
	const searchParams = window?.location?.search ?? '';
	return `${destination}${searchParams}`;
}
