import type { FeedbackTopicData } from '@/components/visualizations/Feedback';

import {
	FEEDBACK_TOPIC_PLACEHOLDER_DATA,
	FeedbackCategoryList,
	FeedbackChartCard,
	FeedbackSummaryGrid,
	TopFeedbackLines,
} from '@/components/visualizations/Feedback';

import styles from './styles.module.css';

/* * */

interface FeedbackTopicProps {
	data?: FeedbackTopicData
	isLoading?: boolean
}

/* * */

export default function FeedbackTopic({ data, isLoading }: FeedbackTopicProps) {
	const feedbackData = data ?? FEEDBACK_TOPIC_PLACEHOLDER_DATA;
	const isPending = isLoading ?? !data;

	return (
		<div className={styles.container}>
			<FeedbackSummaryGrid cards={feedbackData.summaryCards} isLoading={isPending} />

			<section className={styles.contentGrid}>
				<FeedbackChartCard bars={feedbackData.chartBars} isLoading={isPending} title={feedbackData.chartTitle} />
				<FeedbackCategoryList categories={feedbackData.categories} isLoading={isPending} />
			</section>

			<TopFeedbackLines isLoading={isPending} lines={feedbackData.topLines} />
		</div>
	);
}

//
