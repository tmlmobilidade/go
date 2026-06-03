'use client';

import { LinesDetail } from '@/components/lines/detail/LinesDetail';
import { StopsDetail } from '@/components/stops/detail/StopsDetail';
import { FloatingHelpButton } from '@/components/viewport/FloatingHelpButton';
import { Navbar } from '@/components/viewport/Navbar';
import { useColorScheme } from '@mantine/hooks';
import { useEffect } from 'react';

import styles from './styles.module.css';

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
			<div className={styles.viewport}>
				<Navbar />
			</div>
			<FloatingHelpButton />
			<LinesDetail />
			<StopsDetail />
		</>
	);
}
