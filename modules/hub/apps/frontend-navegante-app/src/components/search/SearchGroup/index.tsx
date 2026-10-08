'use client';

import { RegularListItem } from '@/components/common/lists/RegularListItem';
import { SearchResultDisplay } from '@/components/search/SearchResultDisplay';
import { type SearchGroup as SearchGroupData, type SearchResult } from '@/types/common/search';
import { IconAlertTriangle, IconBusStop, IconMapPin } from '@tabler/icons-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface SearchGroupProps {
	group: SearchGroupData
	onSelect: (result: SearchResult) => void
}

const INITIAL_RESULTS = 5;
const ADDITIONAL_RESULTS_PER_CLICK = 30;

/* * */

export function SearchGroup({ group, onSelect }: SearchGroupProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const headingId = useId();
	const [visibleCount, setVisibleCount] = useState(INITIAL_RESULTS);
	const hasMoreResults = visibleCount < group.results.length;

	//
	// B. Render components

	return (
		<section aria-labelledby={headingId} className={styles.group}>
			<h2 id={headingId}>{t(`default:search.Search.groups.${group.key}`)}</h2>
			<ul>
				{group.results.slice(0, visibleCount).map(result => (
					<li key={`${result.type}-${result.id}`}>
						<RegularListItem icon={getResultIcon(result)} onClick={() => onSelect(result)}>
							<SearchResultDisplay result={result} />
						</RegularListItem>
					</li>
				))}
			</ul>
			{hasMoreResults && (
				<button className={styles.showMore} onClick={() => setVisibleCount(count => count + ADDITIONAL_RESULTS_PER_CLICK)} type="button">
					{t(`default:search.Search.show_more.${group.key}`)}
				</button>
			)}
		</section>
	);

	//
}

/* * */

function getResultIcon(result: SearchResult) {
	if (result.type === 'alert') return <IconAlertTriangle size={22} />;
	if (result.type === 'poi') return <IconMapPin size={22} />;
	if (result.type === 'stop') return <IconBusStop size={22} />;
	return undefined;
}
