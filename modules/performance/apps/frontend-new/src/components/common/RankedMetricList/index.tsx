/* * */

import { type MetricTrendDirection } from '@/utils/metric-trend';
import { Progress } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export interface RankedMetricListItem {
	change: {
		direction: MetricTrendDirection
		label: string
	}
	id: string
	label: string
	progressValue: number
	value: string
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
						<span>{item.value}</span>
						<small data-direction={item.change.direction}>{item.change.label}</small>
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
