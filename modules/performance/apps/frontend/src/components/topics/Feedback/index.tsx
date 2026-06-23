/* * */

'use client';

import type { FeedbackPreviewResponse, FeedbackTopicData } from '@/components/visualizations/Feedback/feedback-home';

import { FeedbackOverview } from '@/components/visualizations/Feedback/feedback-home';
import { Routes } from '@/routes';
import useSWR from 'swr';

import styles from './styles.module.css';

import { FeedbackDashboards } from './FeedbackDashboards';

/* * */

interface FeedbackTopicProps {
	data?: FeedbackTopicData
}

/* * */

export default function FeedbackTopic({ data }: FeedbackTopicProps) {
	const { data: feedbackPreviewData } = useSWR<FeedbackPreviewResponse>(
		data ? null : Routes.FEEDBACK_PREVIEW,
	);

	return (
		<div className={styles.container}>
			<FeedbackOverview data={data} previewData={feedbackPreviewData} />
			<FeedbackDashboards />
		</div>
	);
}

//
