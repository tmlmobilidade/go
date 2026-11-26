'use client';

import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react';
import { BottomSheet } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { LandingOverviewTheme } from '../../overview/LandingOverviewTheme';
import { type LandingAppearanceMode, type UseLandingAppearanceReturnType } from '../LandingHeader/use-landing-appearance';

/* * */

interface LandingHeaderPreferencesProps {
	appearance: UseLandingAppearanceReturnType
	onClose: () => void
	opened: boolean
}

/* * */

export function LandingHeaderPreferences({ appearance, onClose, opened }: LandingHeaderPreferencesProps) {
	//
	// A. Setup variables

	const { t } = useTranslation();
	const modes: { icon: typeof IconSun, value: LandingAppearanceMode }[] = [
		{ icon: IconSun, value: 'light' },
		{ icon: IconMoon, value: 'dark' },
		{ icon: IconDeviceDesktop, value: 'system' },
	];

	//
	// B. Render components

	return (
		<BottomSheet closeLabel={t('landing:shared.LandingHeaderPreferences.close')} onClose={onClose} opened={opened} title={t('landing:shared.LandingHeaderPreferences.title')}>
			<div className={styles.body}>
				<fieldset className={styles.fieldset}>
					<legend>{t('landing:shared.LandingHeaderPreferences.appearance')}</legend>
					<div className={styles.modes}>
						{modes.map(({ icon: Icon, value }) => (
							<button key={value} aria-pressed={appearance.mode === value} className={styles.mode} onClick={() => appearance.setMode(value)} type="button">
								<Icon aria-hidden="true" size={22} stroke={1.75} />
								{t(`landing:shared.LandingHeaderPreferences.modes.${value}`)}
							</button>
						))}
					</div>
				</fieldset>
				<fieldset className={styles.fieldset}>
					<legend>{t('landing:shared.LandingHeaderPreferences.accent_colour')}</legend>
					<LandingOverviewTheme activeTheme={appearance.theme} onChange={appearance.setTheme} expanded />
				</fieldset>
			</div>
		</BottomSheet>
	);
}
