/* * */

'use client';

import type { PublicFeedback } from '@tmlmobilidade/types';

import { Routes } from '@/routes';
import useSWR from 'swr';

import styles from './styles.module.css';

import { FeedbackDashboards } from './FeedbackDashboards';
import { FeedbackOverview } from './FeedbackOverview';

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
