'use client';

import { useEffect } from 'react';

import { useAnalyticsContext } from './use-analytics-context';

/* * */

/** Call once in an authenticated frontend layout; disabling or unmounting ends capture. */
export function useSessionReplay(enabled = true) {
	const { actions: { startReplay, stopReplay }, flags: { ready } } = useAnalyticsContext();

	useEffect(() => {
		if (!enabled || !ready) return;
		void startReplay();
		const resume = (event: PageTransitionEvent) => {
			if (event.persisted) void startReplay();
		};
		window.addEventListener('pagehide', stopReplay);
		window.addEventListener('pageshow', resume);
		return () => {
			window.removeEventListener('pagehide', stopReplay);
			window.removeEventListener('pageshow', resume);
			stopReplay();
		};
	}, [enabled, ready, startReplay, stopReplay]);
}
