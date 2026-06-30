'use client';

import styles from './styles.module.css';

/* * */

interface FeedbackImprovementPromptProps {
	onClick: () => void
}

/* * */

export function FeedbackImprovementPrompt({ onClick }: FeedbackImprovementPromptProps) {
	return (
		<div className={styles.improvementPrompt}>
			<button className={styles.improvementButton} onClick={onClick} type="button">O que poderíamos melhorar?</button>
		</div>
	);
}
