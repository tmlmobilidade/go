'use client';

import { IconSend } from '@tabler/icons-react';
import clsx from 'clsx';

import styles from './styles.module.css';

/* * */

export interface FeedbackSubmitButtonProps {
	className?: string
	onClick: () => void
}

/* * */

export function FeedbackSubmitButton({ className, onClick }: FeedbackSubmitButtonProps) {
	return (
		<button className={clsx(styles.button, className)} onClick={onClick} type="button">
			<IconSend aria-hidden={true} size={18} stroke={2.2} />
			<span>Enviar feedback</span>
		</button>
	);
}
