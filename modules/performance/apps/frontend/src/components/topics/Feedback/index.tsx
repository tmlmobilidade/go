/* * */

'use client';

import type { PublicFeedback } from '@tmlmobilidade/go-types-performance';

import { useFeedbackOperatorFilter } from '@/hooks/feedback/use-feedback-operator-filter';
import { Routes } from '@/routes';
import useSWR from 'swr';

import styles from './styles.module.css';

import { FeedbackDashboards } from './FeedbackDashboards';
import { FeedbackOverview } from './FeedbackOverview';

/* * */

export default function FeedbackTopic() {
	const { data: feedbackRows, isLoading } = useSWR<PublicFeedback[]>(Routes.FEEDBACK_PREVIEW);
	const operatorFilter = useFeedbackOperatorFilter(feedbackRows, 'all');

	return (
		<div className={styles.container}>
			<FeedbackOverview isLoading={isLoading} operatorRows={operatorFilter.availableRows} rows={operatorFilter.rows} />
			<FeedbackDashboards />
		</div>
	);
}
