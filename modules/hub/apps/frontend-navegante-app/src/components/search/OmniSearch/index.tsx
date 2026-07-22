'use client';

import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { getLastOmniSearchQuery, setLastOmniSearchQuery, subscribeToOmniSearchQuery } from '@/components/search/omni-search-query';
import { OmniSearchGroup } from '@/components/search/OmniSearchGroup';
import { type OmniSearchResult, useOmniSearch } from '@/components/search/useOmniSearch';
import { mapHubStopToRoutePlannerLocation } from '@/utils/route-planner-locations';
import { type RoutePlannerLocation } from '@/utils/route-planner-motis';
import { IconSearch } from '@tabler/icons-react';
import { type RefObject, useRef, useState, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface OmniSearchProps {
	inputRef?: RefObject<HTMLInputElement | null>
	locationPicker?: boolean
	onLocationSelect?: (location: RoutePlannerLocation) => void
	placeholder?: string
	variant?: 'sheet' | 'top'
}

export function OmniSearch({ inputRef: inputRefProp, locationPicker = false, onLocationSelect, placeholder, variant = 'sheet' }: OmniSearchProps) {
	//

	// A. Setup variables

	const { t } = useTranslation();
	const { setActiveBottomSheet } = useBottomSheet();
	const routePlannerContext = useRoutePlannerContext();
	const sharedQuery = useSyncExternalStore(subscribeToOmniSearchQuery, getLastOmniSearchQuery, getLastOmniSearchQuery);
	const [locationPickerQuery, setLocationPickerQuery] = useState('');
	const query = locationPicker ? locationPickerQuery : sharedQuery;
	const internalInputRef = useRef<HTMLInputElement>(null);
	const inputRef = inputRefProp ?? internalInputRef;
	const search = useOmniSearch(query);
	const visibleGroups = locationPicker
		? search.groups.filter(group => group.key === 'poi' || group.key === 'stop')
		: search.groups;

	//
	// B. Handle actions

	const handleSelect = (result: OmniSearchResult) => {
		if (locationPicker) {
			const location = getRoutePlannerLocation(result);
			if (location) onLocationSelect?.(location);
			return;
		}

		if (result.type === 'line') setActiveBottomSheet({ entityId: result.id, view: 'lines-detail' });
		if (result.type === 'stop') setActiveBottomSheet({ entityId: result.id, view: 'stops-detail' });
		if (result.type === 'alert') setActiveBottomSheet({ entityId: result.id, view: 'alerts-detail' });
		if (result.type === 'poi') void routePlannerContext.actions.openPlace(result.entity);
	};

	const handleQueryChange = (value: string) => {
		if (locationPicker) {
			setLocationPickerQuery(value);
			return;
		}

		setLastOmniSearchQuery(value);
	};

	//
	// D. Render components

	return (
		<div className={styles.container} data-variant={variant}>
			<label className={styles.inputWrapper}>
				<IconSearch size={20} />
				<input ref={inputRef} autoFocus={variant === 'sheet'} onChange={event => handleQueryChange(event.currentTarget.value)} placeholder={placeholder ?? t('default:search.OmniSearch.placeholder')} type="search" value={query} />
			</label>

			{visibleGroups.map(group => (
				<OmniSearchGroup key={group.key} group={group} onSelect={handleSelect} variant={variant} />
			))}

			{search.isLoading && <p className={styles.status}>{t('default:search.OmniSearch.loading')}</p>}
			{search.error && <p className={styles.status}>{search.error}</p>}
			{query.trim().length >= 2 && !search.isLoading && !search.error && visibleGroups.length === 0 && <p className={styles.status}>{t('default:search.OmniSearch.empty')}</p>}
		</div>
	);
}

/* * */

function getRoutePlannerLocation(result: OmniSearchResult): null | RoutePlannerLocation {
	if (result.type === 'poi') return result.entity;
	if (result.type !== 'stop') return null;

	return mapHubStopToRoutePlannerLocation(result.entity, { ensureGtfsId: true });
}
