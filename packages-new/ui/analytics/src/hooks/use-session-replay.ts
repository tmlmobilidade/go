'use client';

import { useEffect } from 'react';

import { useAnalyticsContext } from './use-analytics-context';

/* * */

export function useSessionReplay(enabled: boolean): void {
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
