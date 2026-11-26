'use client';

import { IconChevronDown, IconSettings } from '@tabler/icons-react';
import { useLocaleContext } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { type UseLandingAppearanceReturnType } from '../LandingHeader/use-landing-appearance';
import { LandingHeaderLanguage } from '../LandingHeaderLanguage';
import { LandingHeaderPreferences } from '../LandingHeaderPreferences';

/* * */

interface LandingHeaderMobileProps {
	appearance: UseLandingAppearanceReturnType
}

/* * */

export function LandingHeaderMobile({ appearance }: LandingHeaderMobileProps) {
	//
	// A. Setup variables

	const { t } = useTranslation();
	const locale = useLocaleContext();
	const [activeSheet, setActiveSheet] = useState<'language' | 'preferences' | null>(null);

	//
	// B. Render components

	return (
		<div className={styles.controls}>
			<button aria-haspopup="dialog" aria-label={t('landing:shared.LandingHeaderMobile.language')} className={styles.language} onClick={() => setActiveSheet('language')} type="button">
				<span aria-hidden="true">{locale.data.locale.toUpperCase()}</span>
				<IconChevronDown aria-hidden="true" size={16} />
			</button>
			<button aria-haspopup="dialog" aria-label={t('landing:shared.LandingHeaderPreferences.title')} className={styles.preferences} onClick={() => setActiveSheet('preferences')} type="button">
				<IconSettings aria-hidden="true" size={22} stroke={1.75} />
			</button>
			<LandingHeaderLanguage onClose={() => setActiveSheet(null)} opened={activeSheet === 'language'} />
			<LandingHeaderPreferences appearance={appearance} onClose={() => setActiveSheet(null)} opened={activeSheet === 'preferences'} />
		</div>
	);
}
