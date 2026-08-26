/* * */

import { DashboardCard } from '@/components/common/DashboardCard';
import { MetricTrend } from '@/components/common/MetricTrend';
import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { createMetricTrend } from '@/utils/metric-trend';
import { type PerformanceNetworkPattern, type PlannedSupplyPatternItem } from '@tmlmobilidade/go-types-performance';
import { Table } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface LineSupplyPatternsProps {
	items: PlannedSupplyPatternItem[]
	patterns: PerformanceNetworkPattern[]
}

/* * */

export function LineSupplyPatterns({ items, patterns }: LineSupplyPatternsProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const formatters = usePerformanceFormatters();
	const metadata = new Map(patterns.map(pattern => [pattern._id, pattern]));

	//
	// B. Render components

	return (
		<DashboardCard
			description={t('lineDetail.plannedSupply.patterns.description')}
			title={t('lineDetail.plannedSupply.patterns.title')}
		>
			{items.length ? (
				<div className={styles.tableScroll}>
					<Table
						aria-label={t('lineDetail.plannedSupply.patterns.title')}
						className={styles.table}
						horizontalSpacing="sm"
						verticalSpacing="xs"
						highlightOnHover
					>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>{t('lineDetail.patternsTable.columns.pattern')}</Table.Th>
								<Table.Th>{t('lineDetail.plannedSupply.patterns.rides')}</Table.Th>
								<Table.Th>{t('lineDetail.plannedSupply.patterns.share')}</Table.Th>
								<Table.Th>{t('lineDetail.plannedSupply.patterns.vehicleKm')}</Table.Th>
								<Table.Th>{t('lineDetail.plannedSupply.patterns.change')}</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{items.map((item) => {
								const pattern = metadata.get(item.id);
								const difference = item.rides_difference_pct;
								const trend = createMetricTrend(difference, { formatValue: formatters.signedPercentage });

								return (
									<Table.Tr key={item.id}>
										<Table.Td>
											<div className={styles.identity}>
												<strong>{pattern?.code ?? item.id}</strong>
												<span>{pattern ? `${pattern.origin} → ${pattern.destination}` : item.id}</span>
											</div>
										</Table.Td>
										<Table.Td className={styles.metric}>{formatters.compact(item.current_rides_qty)}</Table.Td>
										<Table.Td className={styles.metric}>{formatters.percentage(item.rides_share_pct)}</Table.Td>
										<Table.Td className={styles.metric}>{formatters.compact(item.current_vehicle_km)} km</Table.Td>
										<Table.Td className={styles.metric}>
											{trend ? (
												<MetricTrend
													direction={trend.direction}
													label={trend.label}
													sentiment={trend.sentiment}
													size="sm"
												/>
											) : '—'}
										</Table.Td>
									</Table.Tr>
								);
							})}
						</Table.Tbody>
					</Table>
				</div>
			) : <p className={styles.empty}>{t('lineDetail.plannedSupply.unavailable')}</p>}
		</DashboardCard>
	);

	//
}
