/* * */

import { PAGE_ROUTES } from '@tmlmobilidade/consts';

/**
 * Get the safe redirect to URL.
 * If the value is not a valid URL, return the home page.
 * @param value The value to get the safe redirect to URL from.
 * @returns The safe redirect to URL.
 */
export function getSafeRedirectToUrl(value: null | string): string {
	//

	//
	// Set the fallback URL.

	const fallbackUrl = PAGE_ROUTES.core.HOME_LIST;

	//
	// If the value is not a valid URL, return the home page.

	if (!value) return fallbackUrl;
	if (!value.startsWith('/')) return fallbackUrl;
	if (value.startsWith('//')) return fallbackUrl;

	//
	// Try to parse the value as a URL.

	try {
		// Use an invalid URL to parse the value. This is to avoid the browser's security restrictions
		// that would prevent the user from being redirected to the desired URL.
		const destination = new URL(value, 'https://go.invalid');
		if (destination.origin !== 'https://go.invalid') return fallbackUrl;
		if (destination.pathname.startsWith('//')) return fallbackUrl;
		// Return the safe redirect to URL.
		return `${destination.pathname}${destination.search}${destination.hash}`;
	} catch {
		// If the value is not a valid URL, return the home page.
		return fallbackUrl;
	}
}
