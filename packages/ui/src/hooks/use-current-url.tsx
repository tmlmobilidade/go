'use client';

/* * */

import { useEffect, useState } from 'react';

/**
 * A custom hook to get the current URL.
 * @param refreshRate The rate at which to refresh the URL. Defaults to `100` ms.
 * @returns The current URL.
 */
export function useCurrentUrl(refreshRate?: number): string | undefined {
	//

	//
	// A. Setup variables

	const [urlValue, setUrlValue] = useState<string | undefined>();

	//
	// B. Handle actions

	const updateUrlValue = () => {
		const value = window.location.href;
		setUrlValue(value);
	};

	useEffect(() => {
		updateUrlValue();
		const interval = setInterval(updateUrlValue, refreshRate ?? 100);
		return () => clearInterval(interval);
	}, []);

	//
	// C. Render components

	return urlValue;

	//
}
