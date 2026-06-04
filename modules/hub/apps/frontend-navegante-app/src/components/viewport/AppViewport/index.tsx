'use client';

import { HelpDetail } from '@/components/help/HelpDetail';
import { LinesDetail } from '@/components/lines/detail/LinesDetail';
import { FloatingBar } from '@/components/viewport/FloatingBar';
import { NavigationBar } from '@/components/viewport/NavigationBar';
import { useColorScheme } from '@mantine/hooks';
import { useEffect } from 'react';

/* * */

export function AppViewport() {
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
			<NavigationBar />
			<FloatingBar />
			<LinesDetail />
			<HelpDetail />
		</>
	);
}
