/* * */

import { FeedbackGraphCard } from '@/components/visualizations/Feedback';
import { Routes } from '@/routes';
import { getFeedbackOverviewData } from '@/utils/feedback/feedback-preview';
import { buildLineLabelsById, buildStopLabelsById, type FeedbackNetworkLine, type FeedbackNetworkStop } from '@/utils/feedback/network-labels';
import { buildOperatorApprovalIndexes } from '@/utils/feedback/operators';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PublicFeedback } from '@tmlmobilidade/go-types-performance';
import { useDataAgencies } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

import { FeedbackOperatorsCard } from './components/FeedbackOperatorsCard';
import { TopFeedbackEntities } from './components/TopFeedbackEntities';
import { TopFeedbackReasonsChart } from './components/TopFeedbackReasonsChart';

/* * */

interface FeedbackOverviewProps {
	isLoading?: boolean
	operatorRows: PublicFeedback[]
	rows: PublicFeedback[]
}

/* * */

export function FeedbackOverview({ isLoading, operatorRows, rows }: FeedbackOverviewProps) {
	//
	// A. Fetch data

	const { data: linesData } = useSWR<FeedbackNetworkLine[], Error>({ credentials: 'omit', url: Routes.HUB_LINES });
	const { data: stopsData } = useSWR<FeedbackNetworkStop[], Error>({ credentials: 'omit', url: Routes.HUB_STOPS });
	const { raw: operatorsData } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST);

	//
	// B. Transform data

	const linesById = useMemo(() => buildLineLabelsById(linesData), [linesData]);
	const stopsById = useMemo(() => buildStopLabelsById(stopsData), [stopsData]);
	const feedbackData = useMemo(() => getFeedbackOverviewData(rows, linesById, stopsById), [linesById, rows, stopsById]);
	const operatorApprovalIndexes = useMemo(() => buildOperatorApprovalIndexes(operatorRows), [operatorRows]);
	const operatorApprovals = useMemo(() => {
		return (operatorsData ?? []).flatMap((operator) => {
			const satisfactionIndex = operatorApprovalIndexes.get(operator._id);

			// Operators without feedback are intentionally omitted from the table.
			if (satisfactionIndex === undefined) return [];

			return [{ operator, satisfactionIndex }];
		});
	}, [operatorApprovalIndexes, operatorsData]);

	//
	// C. Render components

	return (
		<>
			<FeedbackGraphCard isLoading={isLoading} rows={rows} />

			<section className={styles.listsGrid}>
				<TopFeedbackEntities items={feedbackData.topLines} nameColumnLabel="Linha" title="Linhas com mais feedbacks" />
				<TopFeedbackEntities items={feedbackData.topStops} nameColumnLabel="Paragem" title="Paragens com mais feedbacks" />
			</section>

			<section className={styles.listsGrid}>
				<TopFeedbackReasonsChart data={feedbackData.topLineReasons} title="Motivos com mais feedbacks nas linhas" trendData={feedbackData.topLineReasonsTrend} />
				<TopFeedbackReasonsChart data={feedbackData.topStopReasons} title="Motivos com mais feedbacks nas paragens" trendData={feedbackData.topStopReasonsTrend} />
			</section>

			{operatorApprovals.length > 0 && (
				<FeedbackOperatorsCard operatorApprovals={operatorApprovals} />
			)}
		</>
	);
}
