'use client';

import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface FeedbackImprovementPromptProps {
	onClick: () => void
}

/* * */

export function FeedbackImprovementPrompt({ onClick }: FeedbackImprovementPromptProps) {
	const { t } = useTranslation();

	return (
		<div className={styles.improvementPrompt}>
			<button className={styles.improvementButton} onClick={onClick} type="button">{t('default:feedback.FeedbackImprovementPrompt.button')}</button>
		</div>
	);
}
