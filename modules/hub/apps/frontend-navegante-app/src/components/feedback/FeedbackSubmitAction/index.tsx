'use client';

import styles from './styles.module.css';

/* * */

export function FeedbackSubmitAction() {
	return (
		<div className={styles.submitLayer}>
			<button className={styles.submitButton} type="button">Enviar feedback</button>
		</div>
	);
}
