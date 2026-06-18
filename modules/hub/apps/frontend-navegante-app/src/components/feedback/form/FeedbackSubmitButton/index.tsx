'use client';

import { IconSend } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

interface FeedbackSubmitButtonProps {
	onClick: () => void
}

/* * */

export function FeedbackSubmitButton({ onClick }: FeedbackSubmitButtonProps) {
	return (
		<div className={styles.container}>
			<button className={styles.button} onClick={onClick} type="button">
				<IconSend aria-hidden={true} size={18} stroke={2.2} />
				<span>Enviar feedback</span>
			</button>
		</div>
	);
}
