'use client';

/* * */

import { DashboardCard } from '@/components/common/DashboardCard';
import { MetricText } from '@/components/common/MetricText';
import { MetricTrend } from '@/components/common/MetricTrend';
import { PerformanceCsvExportButton } from '@/components/common/PerformanceCsvExportButton';
import { Alert, Skeleton, Table } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useLineSupplyPatternsData } from './useLineSupplyPatternsData';

/* * */

export function LineSupplyPatterns() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const patternsData = useLineSupplyPatternsData();
	const { items, line, patterns } = patternsData.data;
	const patternById = useMemo(() => new Map(patterns.map(pattern => [pattern._id, pattern])), [patterns]);
	const exportRows = useMemo(() => items.map((item) => {
		const pattern = patternById.get(item.id);
		return {
			...item,
			pattern_code: pattern?.code,
			pattern_destination: pattern?.destination,
			pattern_headsign: pattern?.headsign,
			pattern_origin: pattern?.origin,
		};
	}), [items, patternById]);

	//
	// B. Render components

	return (
		<DashboardCard
			description={t('lineDetail.plannedSupply.patterns.description')}
			title={t('lineDetail.plannedSupply.patterns.title')}
			action={(
				<PerformanceCsvExportButton
					datasets={[{ rows: exportRows }]}
					disabled={patternsData.flags.has_error || patternsData.flags.is_loading || !items.length}
					filenameParts={[line?.code]}
					metadata={{ line_code: line?.code, line_id: line?._id }}
					visualizationId="supply-patterns"
				/>
			)}
		>
			{patternsData.flags.has_error ? <Alert color="red" variant="light">{t('lineDetail.plannedSupply.dashboardError')}</Alert> : patternsData.flags.is_loading ? <Skeleton height={326} /> : items.length ? (
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
								const pattern = patternById.get(item.id);

								return (
									<Table.Tr key={item.id}>
										<Table.Td>
											<div className={styles.identity}>
												<strong>{pattern?.code ?? item.id}</strong>
												<span>{pattern ? `${pattern.origin} → ${pattern.destination}` : item.id}</span>
											</div>
										</Table.Td>
										<Table.Td className={styles.metric}><MetricText format="compact" value={item.current_rides_qty} /></Table.Td>
										<Table.Td className={styles.metric}><MetricText format="percentage" value={item.rides_share_pct} /></Table.Td>
										<Table.Td className={styles.metric}><MetricText format="compact" suffix=" km" value={item.current_vehicle_km} /></Table.Td>
										<Table.Td className={styles.metric}>
											{item.rides_difference_pct === null
												? '—'
												: <MetricTrend format="percentage" size="sm" value={item.rides_difference_pct} />}
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
