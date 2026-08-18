'use client';

/* * */

import { MetricSummaryCard } from '@/components/common/MetricSummaryCard';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

const SERVICE_SPARKLINE = [95, 94, 96, 95, 93, 91, 96, 98, 97, 95, 96, 96];
const DELAYS_SPARKLINE = [6.2, 6.8, 7.1, 6.7, 7.4, 7.9, 7.2, 8.1, 7.6, 7.4, 7.9, 7.8];
const ADVANCES_SPARKLINE = [3.1, 2.9, 2.8, 3, 2.7, 2.6, 2.9, 2.5, 2.4, 2.6, 2.5, 2.4];

/* * */

export function LineOperationalPreview() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');

	//
	// B. Render components

	return (
		<section aria-label={t('lineDetail.operationalPreview.ariaLabel')} className={styles.root}>
			<header className={styles.header}>
				<div>
					<h2>{t('lineDetail.operationalPreview.title')}</h2>
					<p>{t('lineDetail.operationalPreview.description')}</p>
				</div>
				<span className={styles.badge}>{t('lineDetail.operationalPreview.badge')}</span>
			</header>

			<div className={styles.cards}>
				<MetricSummaryCard
					comparisonLabel={t('lineDetail.operationalPreview.comparison')}
					sparklineData={SERVICE_SPARKLINE}
					sparklineTone="success"
					title={t('lineDetail.operationalPreview.service.title')}
					trend={{ direction: 'down', label: '−2,1 p.p.', sentiment: 'negative' }}
					value="96,1%"
					progress={{
						label: t('lineDetail.operationalPreview.service.target'),
						value: 96.1,
					}}
				/>

				<MetricSummaryCard
					comparisonLabel={t('lineDetail.operationalPreview.comparison')}
					sparklineData={DELAYS_SPARKLINE}
					sparklineTone="warning"
					title={t('lineDetail.operationalPreview.delays.title')}
					trend={{ direction: 'up', label: '+1,2 p.p.', sentiment: 'negative' }}
					value="7,8%"
					progress={{
						label: t('lineDetail.operationalPreview.delays.target'),
						sentiment: 'warning',
						value: 78,
					}}
				/>

				<MetricSummaryCard
					comparisonLabel={t('lineDetail.operationalPreview.comparison')}
					sparklineData={ADVANCES_SPARKLINE}
					sparklineTone="accent"
					title={t('lineDetail.operationalPreview.advances.title')}
					trend={{ direction: 'down', label: '−0,6 p.p.', sentiment: 'positive' }}
					value="2,4%"
					progress={{
						label: t('lineDetail.operationalPreview.advances.target'),
						value: 80,
					}}
				/>
			</div>
		</section>
	);

	//
}
