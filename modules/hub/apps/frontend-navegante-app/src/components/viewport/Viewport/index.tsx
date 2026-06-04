'use client';

import { AlertsList } from '@/components/alerts/list/AlertsList';
import { HelpDetail } from '@/components/help/HelpDetail';
import { LinesDetail } from '@/components/lines/detail/LinesDetail';
import { SearchDetail } from '@/components/search/SearchDetail';
import { StopsListContextProvider } from '@/components/stops/list/StopsList.context';
import { FloatingBar } from '@/components/viewport/FloatingBar';
import { ViewportMap } from '@/components/viewport/ViewportMap';
import { useColorScheme } from '@mantine/hooks';
import { useEffect } from 'react';

/* * */

export function Viewport() {
	//

	//
	// A. Setup variables

	const colorScheme = useColorScheme();

	//
	// B. Handle actions

	useEffect(() => {
		if (typeof document === 'undefined') return;
		document.documentElement.setAttribute('data-mode', colorScheme);
		document.documentElement.setAttribute('data-mantine-color-scheme', colorScheme);
	}, [colorScheme]);

	//
	// C. Render components

	return (
		<>

			<StopsListContextProvider>
				<ViewportMap />
			</StopsListContextProvider>

			<FloatingBar />
			<LinesDetail />
			<HelpDetail />
			<AlertsList />
			<SearchDetail />

		</>
	);
}
