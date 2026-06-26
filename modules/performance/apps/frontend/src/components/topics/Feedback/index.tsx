/* * */

'use client';

import type { PublicFeedback } from '@tmlmobilidade/types';

import { FeedbackOverview } from '@/components/visualizations/Feedback';
import { Routes } from '@/routes';
import useSWR from 'swr';

import styles from './styles.module.css';

import { FeedbackDashboards } from './FeedbackDashboards';

/* * */

export default function FeedbackTopic() {
	const { data: feedbackRows } = useSWR<PublicFeedback[]>(Routes.FEEDBACK_PREVIEW);

	return (
		<div className={styles.container}>
			<FeedbackOverview rows={feedbackRows ?? []} />
			<FeedbackDashboards />
		</div>
	);
}
