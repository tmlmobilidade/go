'use client';

import { IconThumbDown, IconThumbUp } from '@tabler/icons-react';
import { type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface FeedbackMoodSelectorProps {
	onSelectHappy: () => void
	onSelectUnhappy: () => void
	selectedMood: 'happy' | 'unhappy' | null
}

/* * */

export function FeedbackMoodSelector({ children, onSelectHappy, onSelectUnhappy, selectedMood }: PropsWithChildren<FeedbackMoodSelectorProps>) {
	const { t } = useTranslation();

	return (
		<div className={styles.container}>
			<p className={styles.title}>{t('default:feedback.FeedbackMoodSelector.title')}</p>

			<div className={styles.actions}>
				<button className={styles.action} data-selected={selectedMood === 'happy'} onClick={onSelectHappy} type="button">
					<IconThumbUp aria-hidden={true} size={20} stroke={2} />
					<span>{t('default:feedback.FeedbackMoodSelector.happy')}</span>
				</button>

				<button className={styles.action} data-selected={selectedMood === 'unhappy'} onClick={onSelectUnhappy} type="button">
					<IconThumbDown aria-hidden={true} size={20} stroke={2} />
					<span>{t('default:feedback.FeedbackMoodSelector.unhappy')}</span>
				</button>
			</div>

			{children}
		</div>
	);
}
