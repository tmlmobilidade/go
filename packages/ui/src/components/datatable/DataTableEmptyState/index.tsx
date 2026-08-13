'use client';

import { IconMoodCrazyHappyFilled } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { Label } from '../../display';

/* * */

interface DataTableEmptyStateProps {
	description?: string
	icon?: React.ReactNode
	title?: string
}

/* * */

export function DataTableEmptyState({ description, icon, title }: DataTableEmptyStateProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	return (
		<div className={styles.root}>
			{icon || <IconMoodCrazyHappyFilled opacity={0.75} size={120} />}
			<Label size="lg" caps>{title || t('shared:datatable.DataTableEmptyState.title')}</Label>
			<Label size="md">{description || t('shared:datatable.DataTableEmptyState.description')}</Label>
		</div>
	);
}
