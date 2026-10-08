'use client';

import { RegularListItem } from '@/components/common/lists/RegularListItem';
import { SearchResultDisplay } from '@/components/search/SearchResultDisplay';
import { type SearchResult } from '@/types/common/search';
import { IconHistory } from '@tabler/icons-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface SearchRecentResultsProps {
	hasEntries: boolean
	isLoading: boolean
	onClear: () => void
	onSelect: (result: SearchResult) => void
	results: SearchResult[]
	variant: 'sheet' | 'top'
}

/* * */

export function SearchRecentResults({ hasEntries, isLoading, onClear, onSelect, results, variant }: SearchRecentResultsProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const headingId = useId();

	//
	// B. Render components

	return (
		<section aria-labelledby={headingId} className={styles.group} data-variant={variant}>
			<div className={styles.heading}>
				<h2 id={headingId}>{t('default:search.Search.recent.title')}</h2>
				{hasEntries && <button className={styles.clearButton} onClick={onClear} type="button">{t('default:search.Search.recent.clear')}</button>}
			</div>
			{isLoading ? (
				<p className={styles.status} role="status">{t('default:search.Search.recent.loading')}</p>
			) : results.length > 0 ? (
				<ul>
					{results.map(result => (
						<li key={`${result.type}:${result.id}`}>
							<RegularListItem icon={<IconHistory size={22} />} onClick={() => onSelect(result)}>
								<SearchResultDisplay result={result} />
							</RegularListItem>
						</li>
					))}
				</ul>
			) : (
				<p className={styles.status}>{t('default:search.Search.recent.empty')}</p>
			)}
		</section>
	);
}
