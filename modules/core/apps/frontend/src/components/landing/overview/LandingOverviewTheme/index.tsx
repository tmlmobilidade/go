'use client';

import { AVAILABLE_THEMES, ThemeType } from '@tmlmobilidade/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function LandingOverviewTheme() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [activeTheme, setActiveTheme] = useState<ThemeType>('ocean');

	useEffect(() => {
		// Skip if document is unavailable (SSR)
		if (typeof document === 'undefined') return;
		if (typeof activeTheme !== 'string') return;
		// Apply the active theme to the document
		document.documentElement.setAttribute('data-theme', activeTheme);
	}, [activeTheme]);

	//
	// B. Render components

	return (
		<div className={styles.container}>
			{AVAILABLE_THEMES.map(item => (
				<div key={item._id} onClick={() => setActiveTheme(item._id)}>
					{item.name}
				</div>
			))}
		</div>
	);
}
