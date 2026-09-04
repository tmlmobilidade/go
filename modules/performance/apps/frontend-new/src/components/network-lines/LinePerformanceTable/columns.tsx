/* * */

import { MetricText } from '@/components/common/MetricText';
import { MetricTrend } from '@/components/common/MetricTrend';
import { type NetworkLine } from '@/types/network-line';
import { type DataTableV2Column, Tag } from '@tmlmobilidade/ui';
import { type TFunction } from 'i18next';
import Link from 'next/link';

import styles from './styles.module.css';

/* * */

export function createLinePerformanceColumns(t: TFunction, getFilterHref: (pathname: string) => string): DataTableV2Column<NetworkLine>[] {
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
			render: line => (
				<div className={styles.metric}>
					<MetricText as="strong" format="compact" value={line.validations} />
					<MetricTrend format="percentage" size="sm" value={line.validationsDelta} />
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
				<div className={styles.metric} data-status={line.service !== null && line.service < 92 ? 'danger' : undefined}>
					<MetricText as="strong" format="percentage" value={line.service} />
					<MetricTrend format="percentage-points" size="sm" value={line.serviceDelta} />
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
				<div className={styles.metric} data-status={line.delays !== null && line.delays >= 9 ? 'warning' : undefined}>
					<MetricText as="strong" format="percentage" value={line.delays} />
					<MetricTrend format="percentage-points" positiveWhenIncreasing={false} size="sm" value={line.delayDelta} />
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
			render: line => <MetricText as="strong" format="percentage" value={line.advances} />,
			sortable: true,
			sortValue: line => line.advances,
			title: t('networkLines.table.advances'),
			width: '18%',
		},
	];
}
