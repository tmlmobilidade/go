'use client';

import { LiveIcon, RollingNumber, useLocaleContext } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface LandingStatsPanelProps {
	eventsCount: number
	operatorsCount: number
	vehiclesCount: number
}

/* * */

export function LandingStatsPanel({ eventsCount, operatorsCount, vehiclesCount }: LandingStatsPanelProps) {
	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data: { locale } } = useLocaleContext();
	const numberLocale = locale === 'pt' ? 'pt-PT' : locale;
	const numberFormat = new Intl.NumberFormat(numberLocale);
	const thousandSeparator = numberFormat.formatToParts(1_000_000).find(part => part.type === 'group')?.value ?? ',';

	//
	// B. Render components

	return (
		<dl className={styles.panel}>
			<div className={styles.metric}>
				<dt className={styles.label}>{t('landing:stats.LandingStatsPanel.events')}<LiveIcon /></dt>
				<dd className={styles.value}><RollingNumber thousandSeparator={thousandSeparator} value={eventsCount} /></dd>
			</div>
			<div className={styles.metric}>
				<dt className={styles.label}>{t('landing:stats.LandingStatsPanel.vehicles_live')}<LiveIcon /></dt>
				<dd className={styles.value}><RollingNumber thousandSeparator={thousandSeparator} value={vehiclesCount} /></dd>
			</div>
			<div className={styles.secondary}>
				<dt className={styles.label}>{t('landing:stats.LandingStatsPanel.operators')}</dt>
				<dd className={styles.secondaryValue}>{numberFormat.format(operatorsCount)}</dd>
			</div>
		</dl>
	);
}
