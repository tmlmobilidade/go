'use client';

import { AVAILABLE_THEMES, type ThemeType } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface LandingOverviewThemeProps {
	activeTheme: ThemeType
	expanded?: boolean
	onChange: (theme: ThemeType) => void
}

/* * */

export function LandingOverviewTheme({ activeTheme, expanded = false, onChange }: LandingOverviewThemeProps) {
	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<div className={styles.container} data-expanded={expanded}>
			{AVAILABLE_THEMES.map(item => (
				<button
					key={item._id}
					aria-label={t(`landing:overview.LandingOverviewTheme.colours.${item._id}`)}
					aria-pressed={activeTheme === item._id}
					className={styles.option}
					data-active={activeTheme === item._id}
					onClick={() => onChange(item._id)}
					type="button"
				>
					<span className={styles.swatch} data-active={activeTheme === item._id} data-theme={item._id} />
				</button>
			))}
		</div>
	);
}
