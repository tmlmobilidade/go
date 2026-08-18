'use client';

/* * */

import { LineDemandOverview } from '@/components/line-detail/LineDemandOverview';
import { LineDetailHeader } from '@/components/line-detail/LineDetailHeader';
import { LineDetailNavigation } from '@/components/line-detail/LineDetailNavigation';
import { LineOperationalPreview } from '@/components/line-detail/LineOperationalPreview';
import { LinePatternsTable } from '@/components/line-detail/LinePatternsTable';
import { LineReliabilityHeatmap } from '@/components/line-detail/LineReliabilityHeatmap';
import { useLineDetailData } from '@/hooks/useLineDetailData';
import { Skeleton } from '@tmlmobilidade/ui';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface LineDetailOverviewProps {
	lineId: string
}

/* * */

export function LineDetailOverview({ lineId }: LineDetailOverviewProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const lineDetail = useLineDetailData(lineId);

	//
	// B. Render components

	if (lineDetail.flags.is_line_loading) {
		return (
			<div className={styles.root}>
				<Skeleton className={styles.loadingBreadcrumb} />
				<Skeleton className={styles.loadingHeader} />
				<LineDemandOverview points={[]} total={null} isLoading />
				<Skeleton className={styles.loadingOperational} />
			</div>
		);
	}

	if (lineDetail.flags.has_line_error || !lineDetail.data.line) {
		return (
			<div className={styles.root}>
				<section className={styles.error}>
					<h1>{t('lineDetail.error.title')}</h1>
					<p>{t('lineDetail.error.description', { lineId })}</p>
					<Link href="/network/lines">{t('lineDetail.error.back')}</Link>
				</section>
			</div>
		);
	}

	return (
		<div className={styles.root}>
			<LineDetailHeader line={lineDetail.data.line} />
			<LineDetailNavigation lineId={lineDetail.data.line.code} />
			<LineDemandOverview
				comparison={lineDetail.data.comparison}
				hasError={lineDetail.flags.has_demand_error}
				isLoading={lineDetail.flags.is_demand_loading}
				points={lineDetail.data.points}
				total={lineDetail.data.totalDemand}
			/>
			<LineOperationalPreview />
			<div className={styles.analysisGrid}>
				<LineReliabilityHeatmap />
				<LinePatternsTable
					demandByPatternCode={lineDetail.data.demandByPatternCode}
					hasDemandError={lineDetail.flags.has_pattern_demand_error}
					isLoading={lineDetail.flags.is_pattern_demand_loading}
					patterns={lineDetail.data.line.patterns}
				/>
			</div>
		</div>
	);

	//
}
