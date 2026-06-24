/* * */

import type { SystemStatusType } from '@/constants';

import styles from './styles.module.css';

/* * */

interface FeedbackMetricTagProps {
	label: number | string
	status?: SystemStatusType
}

/* * */

export function FeedbackMetricTag({ label, status }: FeedbackMetricTagProps) {
	return (
		<span className={`${styles.feedbackMetricTag} ${status ? styles[status] : styles.neutral}`}>
			<span className={styles.feedbackMetricTagLabel}>{label}</span>
		</span>
	);
}
