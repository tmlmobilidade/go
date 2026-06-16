'use client';

import { IconMessageCircle } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

interface FeedbackStartPromptProps {
	onClick: () => void
}

/* * */

export function FeedbackStartPrompt({ onClick }: FeedbackStartPromptProps) {
	return (
		<button
			aria-label="Feedback"
			className={styles.container}
			data-label="Dá-nos o teu feedback"
			onClick={onClick}
			type="button"
		>
			<IconMessageCircle aria-hidden={true} size={24} stroke={2} />
		</button>
	);
}
