'use client';

import { useEffect } from 'react';

import { useAnalyticsContext } from './use-analytics-context';

/* * */

/** Opt a user into one capture of up to five minutes; disabling or unmounting ends it earlier. */
export function useSessionReplay(enabled: boolean) {
	const { actions: { startReplay, stopReplay }, flags: { ready } } = useAnalyticsContext();

	useEffect(() => {
		if (!enabled || !ready) return;
		void startReplay();
		window.addEventListener('pagehide', stopReplay);
		return () => {
			window.removeEventListener('pagehide', stopReplay);
			stopReplay();
		};
	}, [enabled, ready, startReplay, stopReplay]);
}
