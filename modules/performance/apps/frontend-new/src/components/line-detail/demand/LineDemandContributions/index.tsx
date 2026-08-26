'use client';

/* * */

import { DashboardCard } from '@/components/common/DashboardCard';
import { RankedMetricList, type RankedMetricListItem } from '@/components/common/RankedMetricList';
import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { getMetricTrendDirection } from '@/utils/metric-trend';
import { type PassengerDemandContributionItem, type PerformanceNetworkPattern } from '@tmlmobilidade/go-types-performance';
import { NoDataLabel, SegmentedControl } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

interface LineDemandContributionsProps {
	patternMetadata: PerformanceNetworkPattern[]
	patterns: PassengerDemandContributionItem[]
	stops: PassengerDemandContributionItem[]
}

/* * */

type ContributionDimension = 'patterns' | 'stops';

/* * */

export function LineDemandContributions({ patternMetadata, patterns, stops }: LineDemandContributionsProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const formatters = usePerformanceFormatters();
	const [dimension, setDimension] = useState<ContributionDimension>('patterns');
	const patternById = useMemo(() => new Map(patternMetadata.map(pattern => [pattern._id, pattern])), [patternMetadata]);
	const items = (dimension === 'patterns' ? patterns : stops).slice(0, 8);
	const maximum = Math.max(...items.map(item => item.current_qty), 1);
	const rankedItems: RankedMetricListItem[] = items.map((item) => {
		const pattern = dimension === 'patterns' ? patternById.get(item.id) : undefined;
		const label = pattern ? `${pattern.origin} → ${pattern.destination}` : item.label ?? (dimension === 'stops' ? t('lineDetail.demandDashboard.contributions.stopLabel', { id: item.id }) : item.id);
		return {
			change: {
				direction: getMetricTrendDirection(item.difference_qty),
				label: formatters.signedCompact(item.difference_qty),
			},
			id: item.id,
			label,
			progressValue: item.current_qty / maximum * 100,
			value: formatters.compact(item.current_qty),
		};
	});

	//
	// B. Render components

	return (
		<DashboardCard
			description={t('lineDetail.demandDashboard.contributions.description')}
			title={t('lineDetail.demandDashboard.contributions.title')}
			action={(
				<SegmentedControl
					appearance="neutral"
					data={(['patterns', 'stops'] as const).map(value => ({ label: t(`lineDetail.demandDashboard.contributions.${value}`), value }))}
					onChange={value => setDimension(value as ContributionDimension)}
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
