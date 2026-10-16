'use client';

import { LinesOverviewMap } from '@/components/lines/overview/LinesOverviewMap';
import { Surface, useAnalyticsContext } from '@tmlmobilidade/ui';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import styles from './styles.module.css';

/* * */

export function LinesOverview() {
	//

	//
	// A. Setup variables

	const { actions: { startReplay, stopReplay, track }, flags: { ready } } = useAnalyticsContext();
	const replayRequested = useSearchParams().get('replay') === 'offer-lines';

	//
	// B. Handle effects

	// The sidebar requests capture; leaving the overview stops it, including cross-module navigation.
	useEffect(() => {
		if (!replayRequested || !ready) return;
		let active = true;
		void startReplay().then((started) => {
			if (active && started) void track('go-offer-frontend-lines-opened');
		});
		window.addEventListener('pagehide', stopReplay);
		return () => {
			active = false;
			window.removeEventListener('pagehide', stopReplay);
			stopReplay();
		};
	}, [ready, replayRequested, startReplay, stopReplay, track]);

	//
	// C. Render components

	return (
		<Surface className={styles.container} height="full">
			<LinesOverviewMap />
		</Surface>
	);

	//
}
