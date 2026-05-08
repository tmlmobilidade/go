'use client';

import { useEffect, useState } from 'react';

/**
 * A custom hook to get the current URL.
 * @param refreshRate The rate at which to refresh the URL. Defaults to `100` ms.
 * @returns The current URL.
 */
export function useCurrentUrl(refreshRate?: number): undefined | URL {
	//

	//
	// A. Setup variables

	const [urlValue, setUrlValue] = useState<undefined | URL>();

	//
	// B. Handle actions

	const updateUrlValue = () => {
		const value = new URL(window.location.href);
		setUrlValue(value);
	};

	useEffect(() => {
		updateUrlValue();
		const interval = setInterval(updateUrlValue, refreshRate ?? 100);
		return () => clearInterval(interval);
	}, [refreshRate]);

	//
	// C. Render components

	return urlValue;

	//
}
