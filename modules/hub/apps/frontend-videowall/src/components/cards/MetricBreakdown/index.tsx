'use client';

/* * */

import { MetricNumber } from '@/components/common/MetricNumber';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export interface MetricBreakdownItem {
	label: string
	primaryDecimalScale?: number
	primarySuffix?: string
	primaryValue: null | number | undefined
	secondaryDecimalScale?: number
	secondaryPrefix?: string
	secondarySuffix?: string
	secondaryValue: null | number | undefined
	sentiment: 'attention' | 'healthy' | 'unavailable'
}

interface Props {
	items: MetricBreakdownItem[]
}

/* * */

export function MetricBreakdown({ items }: Props) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// F. Render components

	return (
		<ul
			aria-label={t('default:videowall.breakdown.operator_metrics')}
			className={styles.container}
		>
			{items.map(item => (
				<li key={item.label} className={styles.item} data-sentiment={item.sentiment}>
					<span>{item.label}</span>
					<strong>
						<MetricNumber
							decimalScale={item.primaryDecimalScale}
							suffix={item.primarySuffix}
							value={item.primaryValue}
						/>
					</strong>
					<small>
						<MetricNumber
							decimalScale={item.secondaryDecimalScale}
							prefix={item.secondaryPrefix}
							suffix={item.secondarySuffix}
							value={item.secondaryValue}
						/>
					</small>
				</li>
			))}
		</ul>
	);

	//
}
