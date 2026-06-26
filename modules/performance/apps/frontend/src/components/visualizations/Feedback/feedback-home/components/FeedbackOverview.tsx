/* * */

import type { FeedbackTopicData } from '../../types';

import { Routes } from '@/routes';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Agency, type HubLine, type HubStop } from '@tmlmobilidade/types';
import { useDataAgencies } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from '../../styles.module.css';

import { buildLineLabelsById, buildStopLabelsById } from '../../network-labels';
import { EMPTY_FEEDBACK_TOPIC_DATA, type FeedbackPreviewResponse, parseFeedbackPreviewData } from '../utils/feedback-preview';
import { buildOperatorApprovalIndexes } from '../utils/operator-approval';
import { sortOperatorsByCode } from '../utils/operators';
import { FeedbackGraphCard } from './FeedbackGraphCard';
import { FeedbackOperatorsCard } from './FeedbackOperatorsCard';
import { TopFeedbackLines } from './TopFeedbackLines';

/* * */

interface FeedbackOverviewProps {
	data?: FeedbackTopicData
	previewData?: FeedbackPreviewResponse
}

/* * */

function useFeedbackNetworkLabels(linesData?: HubLine[], stopsData?: HubStop[]) {
	const linesById = useMemo(() => buildLineLabelsById(linesData), [linesData]);
	const stopsById = useMemo(() => buildStopLabelsById(stopsData), [stopsData]);

	return { linesById, stopsById };
}

function useFeedbackData(data: FeedbackTopicData | undefined, previewData: FeedbackPreviewResponse | undefined, labels: ReturnType<typeof useFeedbackNetworkLabels>) {
	return useMemo(() => {
		if (data) return data;
		if (previewData) return parseFeedbackPreviewData(previewData, labels.linesById, labels.stopsById);
		return EMPTY_FEEDBACK_TOPIC_DATA;
	}, [data, labels.linesById, labels.stopsById, previewData]);
}

function useOperators(operatorsData?: Agency[]) {
	return useMemo(() => sortOperatorsByCode(operatorsData), [operatorsData]);
}

function useOperatorApprovalIndexes(previewData: FeedbackPreviewResponse | undefined, linesData?: HubLine[]) {
	return useMemo(() => {
		if (!previewData) return new Map<string, number>();
		return buildOperatorApprovalIndexes(previewData.rows, linesData);
	}, [linesData, previewData]);
}

/* * */

export function FeedbackOverview({ data, previewData }: FeedbackOverviewProps) {
	const { data: linesData } = useSWR<HubLine[], Error>({ credentials: 'omit', url: Routes.HUB_LINES });
	const { data: stopsData } = useSWR<HubStop[], Error>({ credentials: 'omit', url: Routes.HUB_STOPS });
	const { raw: operatorsData } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST);

	const labels = useFeedbackNetworkLabels(linesData, stopsData);
	const feedbackData = useFeedbackData(data, previewData, labels);
	const operators = useOperators(operatorsData);
	const operatorApprovalIndexes = useOperatorApprovalIndexes(previewData, linesData);

	return (
		<>
			<FeedbackGraphCard rows={previewData?.rows} />

			<section className={styles.listsGrid}>
				<TopFeedbackLines lines={feedbackData.topLines} nameColumnLabel="Linha" title="Linhas com mais feedbacks" />
				<TopFeedbackLines lines={feedbackData.topStops} nameColumnLabel="Paragem" title="Paragens com mais feedbacks" />
			</section>

			<FeedbackOperatorsCard operatorApprovalIndexes={operatorApprovalIndexes} operators={operators} />
		</>
	);
}
