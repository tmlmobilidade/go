'use client';

import { IconSparkles } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { Button } from '../../../buttons/Button';
import { LoadingSection } from '../../../loaders/LoadingSection';

/* * */

interface ChangelogFeedbackProps {
	isError?: boolean
	isLoading?: boolean
	onRetry?: () => void
}

/* * */

export function ChangelogFeedback({ isError, isLoading, onRetry }: ChangelogFeedbackProps) {
	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<div aria-live="polite" className={styles.root} role={isError ? 'alert' : 'status'}>
			{isLoading ? <LoadingSection size="sm" /> : <IconSparkles size={28} aria-hidden />}
			<p>{t(`shared:components.changelog.${isLoading ? 'loading' : isError ? 'error' : 'empty'}`)}</p>
			{isError && <Button label={t('shared:components.changelog.retry')} onClick={onRetry} size="xs" variant="secondary" />}
		</div>
	);
}
