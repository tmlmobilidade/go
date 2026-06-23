/* * */

'use client';

import type { FeedbackPreviewResponse, FeedbackTopicData } from '@/components/visualizations/Feedback';

import {
	FEEDBACK_TOPIC_PLACEHOLDER_DATA,
	FeedbackChartCard,
	parseFeedbackPreviewData,
	TopFeedbackLines,
} from '@/components/visualizations/Feedback';
import { Routes } from '@/routes';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

import { FeedbackDashboards } from './FeedbackDashboards';

/* * */

interface FeedbackTopicProps {
	data?: FeedbackTopicData
	isLoading?: boolean
}

/* * */

export default function FeedbackTopic({ data, isLoading }: FeedbackTopicProps) {
	const { data: feedbackPreviewData, error: feedbackPreviewError, isLoading: isLoadingFeedbackPreview } = useSWR<FeedbackPreviewResponse>(
		data ? null : Routes.FEEDBACK_PREVIEW,
	);

	const fetchedFeedbackData = useMemo<FeedbackTopicData | null>(() => {
		return feedbackPreviewData ? parseFeedbackPreviewData(feedbackPreviewData) : null;
	}, [feedbackPreviewData]);

	const feedbackData = data ?? fetchedFeedbackData ?? FEEDBACK_TOPIC_PLACEHOLDER_DATA;
	const isPending = isLoading ?? (!data && !feedbackPreviewError && isLoadingFeedbackPreview);

	return (
		<div className={styles.container}>
			<FeedbackChartCard bars={feedbackData.chartBars} isLoading={isPending} title={feedbackData.chartTitle} />
			<section className={styles.listsGrid}>
				<TopFeedbackLines isLoading={isPending} lines={feedbackData.topLines} title="Linhas com mais feedbacks" />
				<TopFeedbackLines isLoading={isPending} lines={feedbackData.topStops} title="Stops com mais feedbacks" />
			</section>

			<FeedbackDashboards />
		</div>
	);
}

//
