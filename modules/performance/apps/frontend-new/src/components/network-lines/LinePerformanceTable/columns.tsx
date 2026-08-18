/* * */

import { MetricTrend, type MetricTrendDirection } from '@/components/common/MetricTrend';
import { type NetworkLine } from '@/types/network-line';
import { IconAlertTriangle } from '@tabler/icons-react';
import { type DataTableV2Column, Tag } from '@tmlmobilidade/ui';
import { type TFunction } from 'i18next';
import Link from 'next/link';

import styles from './styles.module.css';

/* * */

const formatPercentage = (value: number) => `${value.toLocaleString('pt-PT', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`;
const formatDelta = (value: number, suffix = '%') => `${value > 0 ? '+' : ''}${value.toLocaleString('pt-PT', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}${suffix}`;
const getTrendDirection = (value: number): MetricTrendDirection => value > 0 ? 'up' : value < 0 ? 'down' : 'flat';

/* * */

export function createLinePerformanceColumns(t: TFunction): DataTableV2Column<NetworkLine>[] {
	return [
		{
			id: 'line',
			render: line => (
				<Link className={styles.lineLink} href={`/network/lines/${encodeURIComponent(line._id)}`}>
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
			render: line => (
				<div className={styles.metric}>
					<strong>{line.validations === null ? '—' : t('networkLines.table.thousands', { value: Math.round(line.validations / 1000) })}</strong>
					{line.validationsDelta !== null && (
						<MetricTrend
							direction={getTrendDirection(line.validationsDelta)}
							label={formatDelta(line.validationsDelta)}
							sentiment={line.validationsDelta >= 0 ? 'positive' : 'negative'}
							size="sm"
						/>
					)}
				</div>
			),
			sortable: true,
			sortValue: line => line.validations,
			title: t('networkLines.table.validations'),
			width: '11%',
		},
		{
			align: 'center',
			id: 'service',
			render: line => (
				<div className={styles.metric} data-status={line.service < 92 ? 'danger' : undefined}>
					<strong>{formatPercentage(line.service)}</strong>
					<MetricTrend
						direction={getTrendDirection(line.serviceDelta)}
						label={formatDelta(line.serviceDelta, ' p.p.')}
						sentiment={line.serviceDelta >= 0 ? 'positive' : 'negative'}
						size="sm"
					/>
				</div>
			),
			sortable: true,
			sortValue: line => line.service,
			title: t('networkLines.table.service'),
			width: '13%',
		},
		{
			align: 'center',
			id: 'delays',
			render: line => (
				<div className={styles.metric} data-status={line.delays >= 9 ? 'warning' : undefined}>
					<strong>{formatPercentage(line.delays)}</strong>
					<MetricTrend
						direction={getTrendDirection(line.delayDelta)}
						label={formatDelta(line.delayDelta, ' p.p.')}
						sentiment={line.delayDelta <= 0 ? 'positive' : 'negative'}
						size="sm"
					/>
				</div>
			),
			sortable: true,
			sortValue: line => line.delays,
			title: t('networkLines.table.delays'),
			width: '9%',
		},
		{
			align: 'center',
			id: 'advances',
			render: line => <strong>{formatPercentage(line.advances)}</strong>,
			sortable: true,
			sortValue: line => line.advances,
			title: t('networkLines.table.advances'),
			width: '11%',
		},
		{
			align: 'center',
			id: 'alerts',
			render: line => line.alerts > 0
				? <span className={styles.alert}><IconAlertTriangle aria-hidden="true" size={17} />{line.alerts}</span>
				: <span className={styles.muted}>—</span>,
			sortable: true,
			sortValue: line => line.alerts,
			title: t('networkLines.table.alerts'),
			width: '7%',
		},
	];
}
