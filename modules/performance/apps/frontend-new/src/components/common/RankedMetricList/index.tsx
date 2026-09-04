/* * */

import { MetricText } from '@/components/common/MetricText';
import { getMetricTrendDirection } from '@/utils/metric-trend';
import { type PerformanceValueFormat } from '@/utils/performance-formatters';
import { Progress } from '@tmlmobilidade/ui';
import { Fragment } from 'react';

import styles from './styles.module.css';

/* * */

interface RankedMetricValue {
	format: PerformanceValueFormat
	signed?: boolean
	suffix?: string
	value: null | number | undefined
}

export interface RankedMetricListItem {
	change?: RankedMetricValue
	id: string
	label: string
	progressValue: number
	values: RankedMetricValue[]
}

interface RankedMetricListProps {
	items: RankedMetricListItem[]
}

/* * */

export function RankedMetricList({ items }: RankedMetricListProps) {
	return (
		<div className={styles.list}>
			{items.map(item => (
				<div key={item.id} className={styles.item}>
					<div className={styles.header}>
						<strong title={item.label}>{item.label}</strong>
						<span>
							{item.values.map((value, index) => (
								<Fragment key={`${value.format}-${index}`}>
									{index > 0 && ' · '}
									<MetricText format={value.format} signed={value.signed} suffix={value.suffix} value={value.value} />
								</Fragment>
							))}
						</span>
						{item.change
							? <small data-direction={getMetricTrendDirection(item.change.value ?? 0)}><MetricText format={item.change.format} signed={item.change.signed} suffix={item.change.suffix} value={item.change.value} /></small>
							: <small />}
					</div>
					<Progress
						aria-label={item.label}
						color="var(--color-primary)"
						size={7}
						value={Math.min(100, Math.max(0, item.progressValue))}
					/>
				</div>
			))}
		</div>
	);
}
