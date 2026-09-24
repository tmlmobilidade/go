'use client';

import { IconSend } from '@tabler/icons-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export interface FeedbackSubmitButtonProps {
	className?: string
	disabled?: boolean
	onClick: () => void
}

/* * */

export function FeedbackSubmitButton({ className, disabled = false, onClick }: FeedbackSubmitButtonProps) {
	const { t } = useTranslation();

	return (
		<button className={clsx(styles.button, className)} disabled={disabled} onClick={onClick} type="button">
			<IconSend aria-hidden={true} size={18} stroke={2.2} />
			<span>{t('default:feedback.form.submit')}</span>
		</button>
	);
}
