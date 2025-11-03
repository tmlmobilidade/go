'use client';

import { VisualizationWrapper } from '@/components/layout/VisualizationWrapper';
import { MetricsRoutes } from '@/routes';
import { type TopMeanDemandByLineByMonth } from '@tmlmobilidade/types';
import { BarChart, MetricsSkeleton } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

export function TopMeanDemandByLineByMonth({ height }: { height?: number }) {
//

	// A. Setup variables

	// B. Fetch data

	const { data } = useSWR<TopMeanDemandByLineByMonth[]>(MetricsRoutes.TOP_MEAN_DEMAND_BY_LINE_BY_MONTH);

	const chartData = useMemo(() => {
		if (!data) return [];
		const monthData = data.find(item => item.properties.year_month === '2025-03');
		if (!monthData) return [];

		return Object.entries(monthData.data).map(([lineId, values]) => ({
			increasePct: values.increase_pct,
			lineId,
			monthQty: values.qty,
			yearAvg: values.year_avg,
		})).sort((a, b) => b.increasePct - a.increasePct);
	}, [data]);

	const lastUpdated = useMemo(() => {
		const monthData = data?.find(item => item.properties.year_month === '2025-03');
		return monthData ? new Date(monthData.generated_at) : undefined;
	}, [data]);

	const hasData = chartData.length > 0;

	return (
		<VisualizationWrapper lastUpdated={lastUpdated} title="Top 10 linhas acima da média anual (mês atual)">

			{hasData ? (
				<BarChart
					data={chartData}
					dataKey="lineId"
					h={height || 300}
					valueFormatter={(v: number) => v.toLocaleString('pt-PT')}
					series={[
						{
							color: 'var(--color-primary)',
							label: '% de aumento vs média anual',
							name: 'increasePct',
						},
					]}
					withBarValueLabel
					withXAxis
					withYAxis
				/>
			) : (
				<MetricsSkeleton height={height || 300} width="100%" />
			)}
		</VisualizationWrapper>
	);
}
