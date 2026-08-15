'use client';

import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { NoDataLabel } from '../../display';

/* * */

interface DataTableEmptyStateProps {
	title?: string
}

/* * */

export function DataTableEmptyState({ title }: DataTableEmptyStateProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<div className={styles.root}>
			<NoDataLabel text={title || t('shared:datatable.DataTableEmptyState.title')} />
		</div>
	);
}
