/* * */

import { LiveIcon } from '@/components/layout/LiveIcon';
import { TrendChip } from '@/components/layout/TrendChip';
import { VisualizationWrapper } from '@/components/layout/VisualizationWrapper';
import { Routes } from '@/routes';
import { Center, Skeleton, Table, Text } from '@mantine/core';
import { type TopLines30DayPerformance } from '@tmlmobilidade/types';
import { Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export default function TopLinesTable() {
	//

	// A. Setup variables

	const { t } = useTranslation();
	const { data: topLinesArray, isLoading } = useSWR<TopLines30DayPerformance[]>(Routes.TOP_LINES_30DAY_PERFORMANCE);

	//
	// B. Transform data

	const tableData = useMemo(() => {
		if (!topLinesArray?.length || !topLinesArray[0]?.data) return [];

		const topLines = topLinesArray[0];

		const topPerformersArray = Object.entries(topLines.data.top_performers).map(([lineId, data]) => ({
			increase_pct: data.increase_pct,
			isTopPerformer: true,
			last_30_days_by_day_type: data.last_30_days_by_day_type,
			last_30_days_total: data.last_30_days_total,
			line_id: lineId,
			ytd_avg: data.ytd_avg,
		})).sort((a, b) => b.increase_pct - a.increase_pct).slice(0, 5);

		const worstPerformersArray = Object.entries(topLines.data.worst_performers).map(([lineId, data]) => ({
			increase_pct: data.increase_pct,
			isTopPerformer: false,
			last_30_days_by_day_type: data.last_30_days_by_day_type,
			last_30_days_total: data.last_30_days_total,
			line_id: lineId,
			ytd_avg: data.ytd_avg,
		})).sort((a, b) => a.increase_pct - b.increase_pct).slice(0, 5).reverse();

		return [...topPerformersArray, ...worstPerformersArray];
	}, [topLinesArray]);

	//
	// C. Helper functions

	const formatNumber = (num: number) => {
		return new Intl.NumberFormat('pt-PT').format(Math.round(num));
	};

	//
	// E. Render table

	const topPerformers = tableData.filter(row => row.isTopPerformer);
	const worstPerformers = tableData.filter(row => !row.isTopPerformer);

	const renderTableRows = (data: typeof tableData, isTopSection: boolean) => {
		return data.map(row => (
			<Table.Tr key={`${isTopSection ? 'top' : 'worst'}-${row.line_id}`}>
				<Table.Td>
					<Text fw={500}>{row.line_id}</Text>
				</Table.Td>
				<Table.Td>
					<TrendChip
						comparisonLabel={null}
						goal="increase"
						percentage={row.increase_pct}
						tooltip={t('performance:visualizations.TopLinesTable.tooltip')}
					/>
				</Table.Td>
				<Table.Td>
					<Text>{formatNumber(row.last_30_days_total)}</Text>
				</Table.Td>
				<Table.Td>
					<Text size="sm">{formatNumber(row.last_30_days_by_day_type.day_type_1 / 30)} {t('performance:visualizations.TopLinesTable.Columns.avg_weekdays')}</Text>
				</Table.Td>
				<Table.Td>
					<Text size="sm">{formatNumber(row.last_30_days_by_day_type.day_type_2 / 30)} {t('performance:visualizations.TopLinesTable.Columns.avg_saturdays')}</Text>
				</Table.Td>
				<Table.Td>
					<Text size="sm">{formatNumber(row.last_30_days_by_day_type.day_type_3 / 30)} {t('performance:visualizations.TopLinesTable.Columns.avg_holidays')}</Text>
				</Table.Td>
			</Table.Tr>
		));
	};

	return (
		<VisualizationWrapper>
			<Section gap="md" padding="none">
				<Section alignItems="center" flexDirection="row" gap="xs" padding="none">
					<h3>{t('performance:visualizations.TopLinesTable.title')}</h3>
					<LiveIcon updatedAt={topLinesArray?.[0]?.generated_at} />
				</Section>

				{isLoading || !topLinesArray?.length ? (
					<Skeleton height={300} />
				) : (
					<Table highlightOnHover striped>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>{t('performance:visualizations.TopLinesTable.Columns.line')}</Table.Th>
								<Table.Th>{t('performance:visualizations.TopLinesTable.Columns.variation')}</Table.Th>
								<Table.Th>{t('performance:visualizations.TopLinesTable.Columns.total_30_days')}</Table.Th>
								<Table.Th>{t('performance:visualizations.TopLinesTable.Columns.avg_weekdays')}</Table.Th>
								<Table.Th>{t('performance:visualizations.TopLinesTable.Columns.avg_saturdays')}</Table.Th>
								<Table.Th>{t('performance:visualizations.TopLinesTable.Columns.avg_holidays')}</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{/* Top Performers */}
							{renderTableRows(topPerformers, true)}

							{/* Separator */}
							<Table.Tr>
								<Table.Td colSpan={6}>
									<Center>
										<Text c="dimmed" size="sm">• • •</Text>
									</Center>
								</Table.Td>
							</Table.Tr>

							{/* Worst Performers */}
							{renderTableRows(worstPerformers, false)}
						</Table.Tbody>
					</Table>
				)}
			</Section>
		</VisualizationWrapper>
	);
}

//
