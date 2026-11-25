'use client';

import { IconMoonFilled, IconSunFilled } from '@tabler/icons-react';
import { useColorScheme } from '@tmlmobilidade/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function LandingOverviewMode() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const systemColorScheme = useColorScheme();
	const [activeMode, setActiveMode] = useState(systemColorScheme);

	useEffect(() => {
		setActiveMode(systemColorScheme);
	}, [systemColorScheme]);

	useEffect(() => {
		// Skip if document is unavailable (SSR)
		if (typeof document === 'undefined') return;
		// Apply the active mode to the document
		document.documentElement.setAttribute('data-mode', activeMode);
		document.documentElement.setAttribute('data-mantine-color-scheme', activeMode);
	}, [activeMode]);

	//
	// B. Render components

	return (
		<button
			aria-label={t('landing:LandingHeader.toggle_mode')}
			className={styles.toggle}
			onClick={() => setActiveMode(activeMode === 'dark' ? 'light' : 'dark')}
			type="button"
		>
			{activeMode === 'dark' ? <IconSunFilled size={18} /> : <IconMoonFilled size={18} />}
		</button>
	);
}
