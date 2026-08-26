/* * */

import { MetricTrend } from '@/components/common/MetricTrend';
import { type PerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { type NetworkLine } from '@/types/network-line';
import { createMetricTrend } from '@/utils/metric-trend';
import { type DataTableV2Column, Tag } from '@tmlmobilidade/ui';
import { type TFunction } from 'i18next';
import Link from 'next/link';

import styles from './styles.module.css';

/* * */

export function createLinePerformanceColumns(t: TFunction, getFilterHref: (pathname: string) => string, formatters: PerformanceFormatters): DataTableV2Column<NetworkLine>[] {
	return [
		{
			id: 'line',
			render: line => (
				<Link className={styles.lineLink} href={getFilterHref(`/network/lines/${encodeURIComponent(line._id)}`)}>
					<Tag label={line.id} variant="secondary" />
					<span className={styles.lineName}><strong>{line.name}</strong></span>
				</Link>
			),
			sortable: true,
			sortDirection: 'asc',
			sortValue: line => line.id,
			title: t('networkLines.table.line'),
			width: '41%',
		},
		{
			id: 'operator',
			render: line => <span className={styles.operator}>{line.operator}</span>,
			sortable: true,
			sortValue: line => line.operator,
			title: t('networkLines.table.operator'),
			width: '8%',
		},
		{
			align: 'center',
			id: 'validations',
			render: (line) => {
				const trend = createMetricTrend(line.validationsDelta, { formatValue: formatters.signedPercentage });
				return (
					<div className={styles.metric}>
						<strong>{line.validations === null ? '—' : t('networkLines.table.thousands', { value: Math.round(line.validations / 1000) })}</strong>
						{trend && (
							<MetricTrend
								direction={trend.direction}
								label={trend.label}
								sentiment={trend.sentiment}
								size="sm"
							/>
						)}
					</div>
				);
			},
			sortable: true,
			sortValue: line => line.validations,
			title: t('networkLines.table.validations'),
			width: '11%',
		},
		{
			align: 'center',
			id: 'service',
			render: (line) => {
				const trend = createMetricTrend(line.serviceDelta, { formatValue: formatters.signedPercentagePoints });
				return (
					<div className={styles.metric} data-status={line.service !== null && line.service < 92 ? 'danger' : undefined}>
						<strong>{line.service === null ? '—' : formatters.percentage(line.service)}</strong>
						{trend && (
							<MetricTrend
								direction={trend.direction}
								label={trend.label}
								sentiment={trend.sentiment}
								size="sm"
							/>
						)}
					</div>
				);
			},
			sortable: true,
			sortValue: line => line.service,
			title: t('networkLines.table.service'),
			width: '13%',
		},
		{
			align: 'center',
			id: 'delays',
			render: (line) => {
				const trend = createMetricTrend(line.delayDelta, { formatValue: formatters.signedPercentagePoints, positiveWhenIncreasing: false });
				return (
					<div className={styles.metric} data-status={line.delays !== null && line.delays >= 9 ? 'warning' : undefined}>
						<strong>{line.delays === null ? '—' : formatters.percentage(line.delays)}</strong>
						{trend && (
							<MetricTrend
								direction={trend.direction}
								label={trend.label}
								sentiment={trend.sentiment}
								size="sm"
							/>
						)}
					</div>
				);
			},
			sortable: true,
			sortValue: line => line.delays,
			title: t('networkLines.table.delays'),
			width: '9%',
		},
		{
			align: 'center',
			id: 'advances',
			render: line => <strong>{line.advances === null ? '—' : formatters.percentage(line.advances)}</strong>,
			sortable: true,
			sortValue: line => line.advances,
			title: t('networkLines.table.advances'),
			width: '18%',
		},
	];
}
