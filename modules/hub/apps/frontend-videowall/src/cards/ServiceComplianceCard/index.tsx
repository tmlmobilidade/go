'use client';

/* * */

import { MetricBreakdown, type MetricBreakdownItem } from '@/components/cards/MetricBreakdown';
import { MetricCardSkeleton } from '@/components/cards/MetricCardSkeleton';
import { MetricNumber } from '@/components/common/MetricNumber';
import { MetricTimestamp } from '@/components/common/MetricTimestamp';
import { ServiceComplianceTrend } from '@/components/service-compliance/ServiceComplianceTrend';
import { IconBus } from '@tabler/icons-react';
import { type ServiceComplianceTrendPoint, type ServiceComplianceValue } from '@tmlmobilidade/go-types-public-info';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface Props {
	agencyLabel?: string
	breakdown?: MetricBreakdownItem[]
	isLoading?: boolean
	isValidating?: boolean
	targetPercentage: number
	timestamp?: number
	trend?: ServiceComplianceTrendPoint[]
	value: null | ServiceComplianceValue | undefined
}

type ServiceComplianceSentiment = 'attention' | 'healthy' | 'unavailable';

/* * */

export function ServiceComplianceCard({
	agencyLabel,
	breakdown,
	isLoading = false,
	isValidating = false,
	targetPercentage,
	timestamp,
	trend = [],
	value,
}: Props) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const sentiment: ServiceComplianceSentiment = value?.compliance_status === 'meets_target'
		? 'healthy'
		: value?.compliance_status === 'below_target'
			? 'attention'
			: 'unavailable';
	const unexecutedPercentage = value?.compliance_pct === null || value?.compliance_pct === undefined
		? null
		: 100 - value.compliance_pct;
	const statusLabel = t(`default:videowall.service_compliance_chart.status.${value?.compliance_status ?? 'unavailable'}`);
	const titleLabel = agencyLabel
		? t('default:videowall.service_compliance_chart.title', '', { agency: agencyLabel })
		: t('default:videowall.service_compliance_chart.title_without_agency');

	//
	// F. Render components

	if (isLoading) return <MetricCardSkeleton />;

	return (
		<article
			aria-busy={isValidating}
			className={styles.container}
			data-layout={breakdown ? 'aggregate' : 'standard'}
			data-sentiment={sentiment}
		>
			<header className={styles.header}>
				<div className={styles.title}>
					<IconBus />
					<h2>{titleLabel}</h2>
				</div>
				<MetricTimestamp timestamp={timestamp} />
			</header>

			<div className={styles.summary}>
				<div className={styles.primaryMetric}>
					<strong><MetricNumber value={value?.unexecuted_rides_qty} /></strong>
					<p>{t('default:videowall.service_compliance_chart.subtitle')}</p>
				</div>

				<div className={styles.comparison}>
					<strong>
						<MetricNumber decimalScale={1} suffix="%" value={unexecutedPercentage} />
					</strong>
					<p>{t('default:videowall.service_compliance_chart.current_non_execution')}</p>
					<span>{statusLabel}</span>
				</div>
			</div>

			<ServiceComplianceTrend
				points={trend}
				targetPercentage={targetPercentage}
			/>

			{breakdown && <MetricBreakdown items={breakdown} />}

			{!value && <p className={styles.unavailable}>{t('default:videowall.unavailable')}</p>}
		</article>
	);

	//
}
