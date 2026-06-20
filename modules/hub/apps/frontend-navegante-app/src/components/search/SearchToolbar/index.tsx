'use client';

import { SearchAgencyChips } from '@/components/search/SearchAgencyChips';
import { SearchInput, Section, SegmentedControl, useFilterStateString } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export type SearchType = 'alerts' | 'lines' | 'stops';

interface SearchToolbarProps {
	onChangeSearchType: (type: SearchType) => void
	searchType: SearchType
}

/* * */

export function SearchToolbar({ onChangeSearchType, searchType }: SearchToolbarProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterSearch = useFilterStateString('search');

	//
	// B. Transform data

	const searchTypeOptions = [
		{ label: t('default:search.SearchToolbar.types.lines'), value: 'lines' },
		{ label: t('default:search.SearchToolbar.types.stops'), value: 'stops' },
		{ label: t('default:search.SearchToolbar.types.alerts'), value: 'alerts' },
	];

	//
	// C. Render components

	return (
		<Section gap="sm">
			<SearchInput onChange={filterSearch.set} value={filterSearch.value} />
			<SegmentedControl
				data={searchTypeOptions}
				onChange={onChangeSearchType}
				value={searchType}
				fullWidth
			/>
			{(searchType === 'stops' || searchType === 'alerts') && (
				<SearchAgencyChips />
			)}
		</Section>
	);

	//
}
