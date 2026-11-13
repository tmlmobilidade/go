'use client';

import { useColorScheme } from '@tmlmobilidade/ui';
import { useEffect } from 'react';

import styles from './styles.module.css';

import { LandingMap } from '../../map/LandingMap';
import { LandingModules } from '../../modules/LandingModules';
import { LandingOverview } from '../../overview/LandingOverview';
import { LandingFooter } from '../LandingFooter';
import { LandingHeader } from '../LandingHeader';

/* * */

export function LandingPage() {
	//

	//
	// A. Handle actions

	const colorScheme = useColorScheme();

	useEffect(() => {
		// Skip if document is unavailable (SSR)
		if (typeof document === 'undefined') return;
		// Set the color scheme to the document
		document.documentElement.setAttribute('data-mode', colorScheme);
		document.documentElement.setAttribute('data-mantine-color-scheme', colorScheme);
	}, [colorScheme]);

	//
	// B. Render components

	return (
		<main className={styles.root}>
			<LandingHeader />
			<LandingMap />
			<LandingOverview />
			<LandingModules />
			<LandingFooter />
		</main>
	);
}
