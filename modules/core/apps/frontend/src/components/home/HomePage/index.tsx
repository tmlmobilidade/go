'use client';

import { HomeQuickLinks } from '@/components/home/HomeQuickLinks';
import { HomeWelcomeMessage } from '@/components/home/HomeWelcomeMessage';
import { LoadingSection, Pane } from '@tmlmobilidade/ui';

import { useHomeQuickLinksData } from '../use-home-quick-links-data';

/* * */

export function HomePage() {
	//

	//
	// A. Setup variables

	const { data, isLoading } = useHomeQuickLinksData();

	//
	// B. Render components

	if (isLoading) {
		return (
			<LoadingSection size="lg" fullHeight />
		);
	}

	if (!data.length) {
		return <HomeWelcomeMessage />;
	}

	return (
		<Pane>
			<HomeQuickLinks />
		</Pane>
	);
}
