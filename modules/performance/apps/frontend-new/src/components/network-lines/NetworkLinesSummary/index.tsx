'use client';

/* * */

import { type NetworkLine } from '@/types/network-line';
import { IconAlertTriangle, IconClockExclamation, IconDatabase, IconTrendingDown } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface NetworkLinesSummaryProps {
	lines: NetworkLine[]
}

/* * */

export function NetworkLinesSummary({ lines }: NetworkLinesSummaryProps) {
	//

	// A. Setup variables

	const { t } = useTranslation('default');
	const belowServiceTarget = lines.filter(line => line.service < 95).length;
	const elevatedDelays = lines.filter(line => line.delays > 10).length;
	const activeAlerts = lines.reduce((total, line) => total + line.alerts, 0);
	const items = [
		{ icon: IconTrendingDown, label: t('networkLines.summary.belowServiceTarget', { count: belowServiceTarget }), tone: 'danger' },
		{ icon: IconClockExclamation, label: t('networkLines.summary.elevatedDelays', { count: elevatedDelays }), tone: 'warning' },
		{ icon: IconAlertTriangle, label: t('networkLines.summary.activeAlerts', { count: activeAlerts }), tone: 'warning' },
		{ icon: IconDatabase, label: t('networkLines.summary.dataCoverage'), tone: 'success' },
	] as const;

	//
	// B. Render components

	return (
		<section aria-label={t('networkLines.summary.ariaLabel')} className={styles.root}>
			{items.map((item) => {
				const Icon = item.icon;

				return (
					<div key={item.label} className={styles.item} data-tone={item.tone}>
						<Icon aria-hidden="true" size={20} stroke={1.8} />
						<span>{item.label}</span>
					</div>
				);
			})}
		</section>
	);

	//
}
