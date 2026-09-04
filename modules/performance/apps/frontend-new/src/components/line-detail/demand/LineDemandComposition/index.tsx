'use client';

/* * */

import { DashboardCard } from '@/components/common/DashboardCard';
import { PerformanceCsvExportButton } from '@/components/common/PerformanceCsvExportButton';
import { RankedMetricList, type RankedMetricListItem } from '@/components/common/RankedMetricList';
import { Alert, NoDataLabel, SegmentedControl, Skeleton } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useLineDemandCompositionData } from './useLineDemandCompositionData';

/* * */

type CompositionDimension = 'categories' | 'products';

/* * */

export function LineDemandComposition() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const composition = useLineDemandCompositionData();
	const [dimension, setDimension] = useState<CompositionDimension>('categories');
	const { categories, line, products } = composition.data;
	const lineCode = line?.code;
	const lineId = line?._id;
	const showComparison = composition.flags.has_comparison;
	const sourceItems = dimension === 'categories' ? categories : products;
	const items = sourceItems.slice(0, 8);
	const exportCategories = useMemo(() => categories.map(item => showComparison ? item : ({ current_qty: item.current_qty, current_share_pct: item.current_share_pct, id: item.id })), [categories, showComparison]);
	const exportProducts = useMemo(() => products.map(item => showComparison ? item : ({ current_qty: item.current_qty, current_share_pct: item.current_share_pct, id: item.id })), [products, showComparison]);
	const rankedItems: RankedMetricListItem[] = items.map(item => ({
		change: showComparison ? {
			format: 'percentage-points',
			signed: true,
			value: item.share_delta_pp,
		} : undefined,
		id: item.id,
		label: item.id === '__unknown__' ? t('lineDetail.demandDashboard.unknown') : item.id,
		progressValue: item.current_share_pct,
		values: [
			{ format: 'compact', value: item.current_qty },
			{ format: 'percentage', value: item.current_share_pct },
		],
	}));

	//
	// B. Render components

	return (
		<DashboardCard
			description={t('lineDetail.demandDashboard.composition.description')}
			title={t('lineDetail.demandDashboard.composition.title')}
			action={(
				<div className={styles.actions}>
					<SegmentedControl
						appearance="neutral"
						aria-label={t('lineDetail.demandDashboard.composition.dimensionLabel')}
						data={(['categories', 'products'] as const).map(value => ({ label: t(`lineDetail.demandDashboard.composition.${value}`), value }))}
						onChange={value => setDimension(value as CompositionDimension)}
						size="sm"
						value={dimension}
					/>
					<PerformanceCsvExportButton
						disabled={composition.flags.has_error || composition.flags.is_loading || (!categories.length && !products.length)}
						filenameParts={[lineCode]}
						metadata={{ comparison_supported: showComparison, line_code: lineCode, line_id: lineId }}
						visualizationId="demand-composition"
						datasets={[
							{ dimensions: { composition_dimension: 'category' }, rows: exportCategories },
							{ dimensions: { composition_dimension: 'product' }, rows: exportProducts },
						]}
					/>
				</div>
			)}
		>
			{composition.flags.has_error
				? <Alert color="red" variant="light">{t('lineDetail.demandDashboard.dashboardError')}</Alert>
				: composition.flags.is_loading
					? <Skeleton height={280} />
					: rankedItems.length
						? <RankedMetricList items={rankedItems} />
						: <NoDataLabel text={t('lineDetail.demandDashboard.unavailable')} />}
		</DashboardCard>
	);

	//
}
