'use client';

/* * */

import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { type NetworkLine } from '@/types/network-line';
import { IconClockExclamation, IconDatabase, IconTrendingDown } from '@tabler/icons-react';
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
	const formatters = usePerformanceFormatters();
	const belowServiceTarget = lines.filter(line => line.service !== null && line.service < 95).length;
	const elevatedDelays = lines.filter(line => line.delays !== null && line.delays > 10).length;
	const coverageValues = lines.flatMap(line => line.coverage === null ? [] : [line.coverage]);
	const coverage = coverageValues.length
		? coverageValues.reduce((total, value) => total + value, 0) / coverageValues.length
		: null;
	const items = [
		{ icon: IconTrendingDown, label: t('networkLines.summary.belowServiceTarget', { count: belowServiceTarget }), tone: 'danger' },
		{ icon: IconClockExclamation, label: t('networkLines.summary.elevatedDelays', { count: elevatedDelays }), tone: 'warning' },
		{ icon: IconDatabase, label: t('networkLines.summary.dataCoverage', { value: coverage === null ? '—' : formatters.fixedDecimal(coverage) }), tone: 'success' },
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
