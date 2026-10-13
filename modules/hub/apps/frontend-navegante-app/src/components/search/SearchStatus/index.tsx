'use client';

import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface SearchStatusProps {
	error: null | string
	isLoading: boolean
	query: string
	resultCount: number
}

/* * */

export function SearchStatus({ error, isLoading, query, resultCount }: SearchStatusProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const hasSearchQuery = query.trim().length >= 2;

	//
	// B. Render components

	if (error) return <p className={styles.status} role="alert">{error}</p>;
	if (isLoading) return <p aria-atomic="true" className={styles.status} role="status">{t('default:search.Search.loading')}</p>;
	if (!hasSearchQuery) return null;
	if (resultCount === 0) return <p aria-atomic="true" className={styles.status} role="status">{t('default:search.Search.empty')}</p>;

	return (
		<p aria-atomic="true" className={styles.visuallyHidden} role="status">
			{t('default:search.Search.results', '', { count: resultCount })}
		</p>
	);

	//
}
