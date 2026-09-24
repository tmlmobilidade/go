'use client';

import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function FeedbackThankYou() {
	const { t } = useTranslation();

	return (
		<div aria-live="polite" className={styles.container} role="status">
			<span className={styles.icon}>
				<IconCheck aria-hidden={true} size={36} stroke={2.6} />
			</span>
			<span className={styles.title}>{t('default:feedback.thank_you.title')}</span>
			<span className={styles.description}>{t('default:feedback.thank_you.description')}</span>
		</div>
	);
}
