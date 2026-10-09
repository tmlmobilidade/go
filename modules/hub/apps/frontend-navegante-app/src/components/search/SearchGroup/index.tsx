'use client';

import { RegularListItem } from '@/components/common/lists/RegularListItem';
import { SearchResultDisplay } from '@/components/search/SearchResultDisplay';
import { type SearchGroup as SearchGroupData, type SearchResult } from '@/types/common/search';
import { IconAlertTriangle, IconBusStop, IconMapPin } from '@tabler/icons-react';
import { useEffect, useId, useRef, useState } from 'react';
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
	const listRef = useRef<HTMLUListElement>(null);
	const nextFocusIndexRef = useRef<null | number>(null);
	const [visibleCount, setVisibleCount] = useState(INITIAL_RESULTS);
	const hasMoreResults = visibleCount < group.results.length;

	//
	// B. Handle actions

	const handleShowMore = () => {
		nextFocusIndexRef.current = visibleCount;
		setVisibleCount(count => count + ADDITIONAL_RESULTS_PER_CLICK);
	};

	useEffect(() => {
		const index = nextFocusIndexRef.current;
		if (index === null) return;
		listRef.current?.children[index]?.querySelector('button')?.focus();
		nextFocusIndexRef.current = null;
	}, [visibleCount]);

	//
	// C. Render components

	return (
		<section aria-labelledby={headingId} className={styles.group}>
			<h2 id={headingId}>{t(`default:search.Search.groups.${group.key}`)}</h2>
			<ul ref={listRef}>
				{group.results.slice(0, visibleCount).map(result => (
					<li key={`${result.type}-${result.id}`}>
						<RegularListItem icon={getResultIcon(result)} onClick={() => onSelect(result)}>
							<SearchResultDisplay result={result} />
						</RegularListItem>
					</li>
				))}
			</ul>
			{hasMoreResults && (
				<button className={styles.showMore} onClick={handleShowMore} type="button">
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
