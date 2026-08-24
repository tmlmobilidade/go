'use client';

import { QuickLinks } from '@/components/home/QuickLinks';
import { WelcomeMessage } from '@/components/home/WelcomeMessage';
import { LoadingSection, Pane } from '@tmlmobilidade/ui';

import { useQuickLinksData } from '../use-quick-links-data';

/* * */

export function HomePage() {
	//

	//
	// A. Setup variables

	const { data, isLoading } = useQuickLinksData();

	//
	// C. Render components

	if (isLoading) {
		return (
			<LoadingSection size="lg" fullHeight />
		);
	}

	if (!data.length) {
		return <WelcomeMessage />;
	}

	return (
		<Pane>
			<QuickLinks />
		</Pane>
	);
}
