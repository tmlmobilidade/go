'use client';

import { useEffect } from 'react';

/**
 * A hook that reloads the app every 5 minutes.
 */
export function useAppReload() {
	useEffect(() => {
		// Reload every 5 minutes
		const interval = setInterval(() => {
			window.location.reload();
		}, 300000);
		return () => clearInterval(interval);
	}, []);
}
