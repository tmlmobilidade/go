'use client';

/* * */

import { DashboardCard } from '@/components/common/DashboardCard';
import { RankedMetricList, type RankedMetricListItem } from '@/components/common/RankedMetricList';
import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { getMetricTrendDirection } from '@/utils/metric-trend';
import { type PassengerDemandCompositionItem } from '@tmlmobilidade/go-types-performance';
import { NoDataLabel, SegmentedControl } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

interface LineDemandCompositionProps {
	categories: PassengerDemandCompositionItem[]
	products: PassengerDemandCompositionItem[]
}

/* * */

type CompositionDimension = 'categories' | 'products';

/* * */

export function LineDemandComposition({ categories, products }: LineDemandCompositionProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const formatters = usePerformanceFormatters();
	const [dimension, setDimension] = useState<CompositionDimension>('categories');
	const items = (dimension === 'categories' ? categories : products).slice(0, 8);
	const rankedItems: RankedMetricListItem[] = items.map(item => ({
		change: {
			direction: getMetricTrendDirection(item.share_delta_pp),
			label: formatters.signedPercentagePoints(item.share_delta_pp),
		},
		id: item.id,
		label: item.id === '__unknown__' ? t('lineDetail.demandDashboard.unknown') : item.id,
		progressValue: item.current_share_pct,
		value: `${formatters.compact(item.current_qty)} · ${formatters.percentage(item.current_share_pct)}`,
	}));

	//
	// B. Render components

	return (
		<DashboardCard
			description={t('lineDetail.demandDashboard.composition.description')}
			title={t('lineDetail.demandDashboard.composition.title')}
			action={(
				<SegmentedControl
					appearance="neutral"
					aria-label={t('lineDetail.demandDashboard.composition.dimensionLabel')}
					data={(['categories', 'products'] as const).map(value => ({ label: t(`lineDetail.demandDashboard.composition.${value}`), value }))}
					onChange={value => setDimension(value as CompositionDimension)}
					size="sm"
					value={dimension}
				/>
			)}
		>
			{rankedItems.length
				? <RankedMetricList items={rankedItems} />
				: <NoDataLabel text={t('lineDetail.demandDashboard.unavailable')} />}
		</DashboardCard>
	);

	//
}
