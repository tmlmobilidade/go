'use client';

import { RegularListItem } from '@/components/common/lists/RegularListItem';
import { SearchResultDisplay } from '@/components/search/SearchResultDisplay';
import { type SearchGroup as SearchGroupData, type SearchResult } from '@/types/common/search';
import { IconAlertTriangle, IconBusStop, IconMapPin } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface SearchGroupProps {
	group: SearchGroupData
	onSelect: (result: SearchResult) => void
	variant: 'sheet' | 'top'
}

/* * */

export function SearchGroup({ group, onSelect, variant }: SearchGroupProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<section className={styles.group} data-variant={variant}>
			<h2>{t(`default:search.Search.groups.${group.key}`)}</h2>
			{group.results.map(result => (
				<RegularListItem key={`${result.type}-${result.id}`} icon={getResultIcon(result)} onClick={() => onSelect(result)}>
					<SearchResultDisplay result={result} />
				</RegularListItem>
			))}
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
