/* * */

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';

import styles from '../../styles.module.css';

/* * */

export function FeedbackGraphCard() {
	return (
		<ContainerWrapper className={styles.feedbackCard} height={360} padding="0">
			<div className={styles.feedbackCardHeader}>
				<p className={styles.cardTitle}>Gráfico Feedback</p>
			</div>

			<div className={`${styles.feedbackCardContent} ${styles.feedbackCardContentFill}`} />
		</ContainerWrapper>
	);
}
