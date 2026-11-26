'use client';

import { IconMoonFilled, IconSunFilled } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface LandingOverviewModeProps {
	activeMode: 'dark' | 'light'
	onChange: (mode: 'dark' | 'light') => void
}

/* * */

export function LandingOverviewMode({ activeMode, onChange }: LandingOverviewModeProps) {
	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<button
			aria-label={t('landing:LandingHeader.toggle_mode')}
			className={styles.toggle}
			onClick={() => onChange(activeMode === 'dark' ? 'light' : 'dark')}
			type="button"
		>
			{activeMode === 'dark' ? <IconSunFilled size={18} /> : <IconMoonFilled size={18} />}
		</button>
	);
}
