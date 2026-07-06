/* * */

'use client';

import type { PublicFeedback } from '@tmlmobilidade/types';

import { useFeedbackOperatorFilter } from '@/hooks/feedback/use-feedback-operator-filter';
import { Routes } from '@/routes';
import useSWR from 'swr';

import styles from './styles.module.css';

import { FeedbackDashboards } from './FeedbackDashboards';
import { FeedbackOverview } from './FeedbackOverview';

/* * */

export default function FeedbackTopic() {
	const { data: feedbackRows } = useSWR<PublicFeedback[]>(Routes.FEEDBACK_PREVIEW);
	const operatorFilter = useFeedbackOperatorFilter(feedbackRows, 'all');

	return (
		<div className={styles.container}>
			<FeedbackOverview operatorRows={feedbackRows ?? []} rows={operatorFilter.rows} />
			<FeedbackDashboards />
		</div>
	);
}
