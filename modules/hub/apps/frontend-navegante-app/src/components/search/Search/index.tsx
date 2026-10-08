'use client';

import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { SearchGroup } from '@/components/search/SearchGroup';
import { SearchRecentResults } from '@/components/search/SearchRecentResults';
import { SearchStatus } from '@/components/search/SearchStatus';
import { SearchTypeChips } from '@/components/search/SearchTypeChips';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { useRecentSearches } from '@/hooks/search/useRecentSearches';
import { useSearch } from '@/hooks/search/useSearch';
import { type SearchGroup as SearchGroupData, type SearchResult } from '@/types/common/search';
import { type RoutePlannerLocation } from '@/types/route-planner/models';
import { mapHubStopToRoutePlannerLocation } from '@/utils/route-planner/planning/locations';
import { getSearchDraft, setSearchDraft, subscribeToSearchDraft } from '@/utils/search/search-draft';
import { IconCurrentLocation, IconX } from '@tabler/icons-react';
import { SearchInput } from '@tmlmobilidade/ui';
import { type RefObject, useRef, useState, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface SearchProps {
	inputRef?: RefObject<HTMLInputElement | null>
	locationPicker?: boolean
	onCurrentLocationSelect?: () => Promise<boolean>
	onLocationSelect?: (location: RoutePlannerLocation) => void
	placeholder?: string
	variant?: 'sheet' | 'top'
}

export function Search({ inputRef: inputRefProp, locationPicker = false, onCurrentLocationSelect, onLocationSelect, placeholder, variant = 'sheet' }: SearchProps) {
	//

	// A. Setup variables

	const { t } = useTranslation();
	const { push } = useBottomSheet();
	const routePlannerContext = useRoutePlannerContext();
	const searchDraft = useSyncExternalStore(subscribeToSearchDraft, getSearchDraft, getSearchDraft);
	const [locationPickerQuery, setLocationPickerQuery] = useState('');
	const [isLocating, setIsLocating] = useState(false);
	const [currentLocationError, setCurrentLocationError] = useState(false);
	const [selectedType, setSelectedType] = useState<null | SearchGroupData['key']>(null);
	const query = locationPicker ? locationPickerQuery : searchDraft;
	const internalInputRef = useRef<HTMLInputElement>(null);
	const inputRef = inputRefProp ?? internalInputRef;
	const recentSearches = useRecentSearches();
	const search = useSearch(query, recentSearches.entries);
	const availableGroups = locationPicker
		? search.groups.filter(group => group.key === 'poi' || group.key === 'stop')
		: search.groups;
	const visibleGroups = selectedType ? availableGroups.filter(group => group.key === selectedType) : availableGroups;
	const resultCount = visibleGroups.reduce((total, group) => total + group.results.length, 0);
	const showRecentSearches = !locationPicker && !query.trim() && recentSearches.isReady;
	const showTypeChips = !locationPicker && query.trim().length >= 2;
	const inputLabel = placeholder ?? t('default:search.Search.input_label');

	//
	// B. Handle actions

	const handleSelect = (result: SearchResult) => {
		if (locationPicker) {
			const location = getRoutePlannerLocation(result);
			if (location) onLocationSelect?.(location);
			return;
		}

		recentSearches.add(result);
		if (result.type === 'line') push({ entityId: result.id, view: 'lines-detail' });
		if (result.type === 'stop') push({ entityId: result.id, view: 'stops-detail' });
		if (result.type === 'alert') push({ entityId: result.id, view: 'alerts-detail' });
		if (result.type === 'poi') void routePlannerContext.actions.openPlace(result.entity);
	};

	const handleQueryChange = (value: string) => {
		if (!value.trim()) setSelectedType(null);
		if (locationPicker) {
			setLocationPickerQuery(value);
			return;
		}

		setSearchDraft(value);
	};

	const handleClear = (onClear: () => void) => {
		setSelectedType(null);
		onClear();
	};

	const handleCurrentLocationSelect = async () => {
		if (!onCurrentLocationSelect || isLocating) return;
		setCurrentLocationError(false);
		setIsLocating(true);
		try {
			const selected = await onCurrentLocationSelect();
			if (!selected) setCurrentLocationError(true);
		} catch {
			setCurrentLocationError(true);
		} finally {
			setIsLocating(false);
		}
	};

	//
	// C. Render components

	return (
		<div className={styles.container} data-variant={variant}>
			<SearchInput
				ref={inputRef}
				aria-label={inputLabel}
				classNames={{ input: styles.input, wrapper: styles.inputWrapper }}
				onChange={handleQueryChange}
				placeholder={placeholder ?? t('default:search.Search.placeholder')}
				rightSectionWidth={48}
				value={query}
				clearButton={onClear => (
					<button aria-label={t('default:search.Search.clear')} className={styles.clearButton} onClick={() => handleClear(onClear)} type="button">
						<IconX size={20} />
					</button>
				)}
			/>
			{locationPicker && onCurrentLocationSelect && (
				<button className={styles.currentLocationButton} disabled={isLocating} onClick={() => void handleCurrentLocationSelect()} type="button">
					<IconCurrentLocation aria-hidden="true" size={22} />
					{t(isLocating ? 'default:routes.RoutePlannerSearch.current_location_loading' : 'default:routes.RoutePlannerSearch.origin.current_location')}
				</button>
			)}
			{currentLocationError && <p className={styles.currentLocationError} role="alert">{t('default:routes.RoutePlannerSearch.current_location_error')}</p>}

			{showTypeChips && <SearchTypeChips onChange={setSelectedType} selectedType={selectedType} />}
			{visibleGroups.map(group => (
				<SearchGroup key={`${group.key}:${query}`} group={group} onSelect={handleSelect} variant={variant} />
			))}
			{showRecentSearches && (
				<SearchRecentResults
					hasEntries={recentSearches.entries.length > 0}
					isLoading={search.isRecentLoading}
					onClear={recentSearches.clear}
					onSelect={handleSelect}
					results={search.recentResults}
					variant={variant}
				/>
			)}

			<SearchStatus error={search.error} isLoading={search.isLoading} query={query} resultCount={resultCount} />
		</div>
	);
}

/* * */

function getRoutePlannerLocation(result: SearchResult): null | RoutePlannerLocation {
	if (result.type === 'poi') return result.entity;
	if (result.type !== 'stop') return null;

	return mapHubStopToRoutePlannerLocation(result.entity, { ensureGtfsId: true });
}
