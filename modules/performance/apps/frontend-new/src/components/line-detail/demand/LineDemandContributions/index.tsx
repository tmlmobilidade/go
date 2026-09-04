'use client';

/* * */

import { DashboardCard } from '@/components/common/DashboardCard';
import { PerformanceCsvExportButton } from '@/components/common/PerformanceCsvExportButton';
import { RankedMetricList, type RankedMetricListItem } from '@/components/common/RankedMetricList';
import { Alert, NoDataLabel, SegmentedControl, Skeleton } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useLineDemandContributionsData } from './useLineDemandContributionsData';

/* * */

type ContributionDimension = 'patterns' | 'stops';

/* * */

export function LineDemandContributions() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const contributions = useLineDemandContributionsData();
	const [dimension, setDimension] = useState<ContributionDimension>('patterns');
	const { line, patterns, stops } = contributions.data;
	const lineCode = line?.code;
	const lineId = line?._id;
	const patternMetadata = useMemo(() => line?.patterns ?? [], [line?.patterns]);
	const showComparison = contributions.flags.has_comparison;
	const patternById = useMemo(() => new Map(patternMetadata.map(pattern => [pattern._id, pattern])), [patternMetadata]);
	const sourceItems = dimension === 'patterns' ? patterns : stops;
	const items = sourceItems.slice(0, 8);
	const exportPatternRows = useMemo(() => patterns.map((item) => {
		const pattern = patternById.get(item.id);
		return {
			...(showComparison ? item : { current_qty: item.current_qty, id: item.id }),
			pattern_code: pattern?.code,
			pattern_destination: pattern?.destination,
			pattern_headsign: pattern?.headsign,
			pattern_origin: pattern?.origin,
		};
	}), [patternById, patterns, showComparison]);
	const exportStopRows = useMemo(() => stops.map(item => showComparison ? item : ({ current_qty: item.current_qty, id: item.id, label: item.label })), [showComparison, stops]);
	const maximum = Math.max(...items.map(item => item.current_qty), 1);
	const rankedItems: RankedMetricListItem[] = items.map((item) => {
		const pattern = dimension === 'patterns' ? patternById.get(item.id) : undefined;
		const label = pattern ? `${pattern.origin} → ${pattern.destination}` : item.label ?? (dimension === 'stops' ? t('lineDetail.demandDashboard.contributions.stopLabel', { id: item.id }) : item.id);
		return {
			change: showComparison ? {
				format: 'compact',
				signed: true,
				value: item.difference_qty,
			} : undefined,
			id: item.id,
			label,
			progressValue: item.current_qty / maximum * 100,
			values: [{ format: 'compact', value: item.current_qty }],
		};
	});

	//
	// B. Render components

	return (
		<DashboardCard
			description={t('lineDetail.demandDashboard.contributions.description')}
			title={t('lineDetail.demandDashboard.contributions.title')}
			action={(
				<div className={styles.actions}>
					<SegmentedControl
						appearance="neutral"
						data={(['patterns', 'stops'] as const).map(value => ({ label: t(`lineDetail.demandDashboard.contributions.${value}`), value }))}
						onChange={value => setDimension(value as ContributionDimension)}
						size="sm"
						value={dimension}
					/>
					<PerformanceCsvExportButton
						disabled={contributions.flags.has_error || contributions.flags.is_loading || (!patterns.length && !stops.length)}
						filenameParts={[lineCode]}
						metadata={{ comparison_supported: showComparison, line_code: lineCode, line_id: lineId }}
						visualizationId="demand-contributions"
						datasets={[
							{ dimensions: { contribution_dimension: 'pattern' }, rows: exportPatternRows },
							{ dimensions: { contribution_dimension: 'stop' }, rows: exportStopRows },
						]}
					/>
				</div>
			)}
		>
			{contributions.flags.has_error
				? <Alert color="red" variant="light">{t('lineDetail.demandDashboard.dashboardError')}</Alert>
				: contributions.flags.is_loading
					? <Skeleton height={280} />
					: rankedItems.length
						? <RankedMetricList items={rankedItems} />
						: <NoDataLabel text={t('lineDetail.demandDashboard.unavailable')} />}
		</DashboardCard>
	);

	//
}
