'use client';

import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { RegularListItem } from '@/components/common/lists/RegularListItem';
import { LineDisplay } from '@/components/lines/common/LineDisplay';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { type OmniSearchResult, useOmniSearch } from '@/components/search/useOmniSearch';
import { getAgencyLogo } from '@/lib/agency-logos-map';
import { AGENCY_NAMES_MAP } from '@/lib/agency-names-map';
import { type RoutePlannerLocation } from '@/utils/route-planner-motis';
import { IconAlertTriangle, IconBusStop, IconMapPin, IconSearch } from '@tabler/icons-react';
import Image from 'next/image';
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

let LAST_OMNI_SEARCH_QUERY = '';
const omniSearchQueryListeners = new Set<() => void>();

function emitOmniSearchQueryChange() {
	omniSearchQueryListeners.forEach(listener => listener());
}

export function subscribeToOmniSearchQuery(listener: () => void) {
	omniSearchQueryListeners.add(listener);
	return () => {
		omniSearchQueryListeners.delete(listener);
	};
}

export function getLastOmniSearchQuery() {
	return LAST_OMNI_SEARCH_QUERY;
}

export function clearLastOmniSearchQuery() {
	if (LAST_OMNI_SEARCH_QUERY === '') return;
	LAST_OMNI_SEARCH_QUERY = '';
	emitOmniSearchQueryChange();
}

function setLastOmniSearchQuery(value: string) {
	if (LAST_OMNI_SEARCH_QUERY === value) return;
	LAST_OMNI_SEARCH_QUERY = value;
	emitOmniSearchQueryChange();
}

/* * */

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
				<section key={group.key} className={styles.group}>
					<h2>{t(`default:search.OmniSearch.groups.${group.key}`)}</h2>
					{group.results.map(result => (
						<RegularListItem key={`${result.type}-${result.id}`} icon={getResultIcon(result)} onClick={() => handleSelect(result)}>
							<OmniSearchResultDisplay result={result} />
						</RegularListItem>
					))}
				</section>
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

	return {
		detail: [result.entity.locality_name, result.entity.municipality_name].filter(Boolean).join(' | '),
		id: `GTFS_${String(result.entity._id).replace(/^GTFS_/, '')}`,
		label: result.entity.name,
		lat: result.entity.latitude,
		lon: result.entity.longitude,
		type: 'STOP',
	};
}

/* * */

function OmniSearchResultDisplay({ result }: { result: OmniSearchResult }) {
	if (result.type === 'line') return <LineDisplay lineData={result.entity} />;
	if (result.type === 'stop') {
		return (
			<div className={styles.stopDisplay}>
				<strong>{result.label}</strong>
				<span>
					<small>{getDetail(result)}</small>
					<StopAgencyLogos agencyIds={result.entity.agency_ids} />
				</span>
			</div>
		);
	}

	return (
		<div className={styles.resultDisplay}>
			<strong>{result.label}</strong>
			{getDetail(result) && <small>{getDetail(result)}</small>}
		</div>
	);
}

function getResultIcon(result: OmniSearchResult) {
	if (result.type === 'alert') return <IconAlertTriangle size={22} />;
	if (result.type === 'poi') return <IconMapPin size={22} />;
	if (result.type === 'stop') return <IconBusStop size={22} />;
	return undefined;
}

function getDetail(result: OmniSearchResult) {
	if (result.type === 'alert') return result.entity.description;
	if (result.type === 'line') return '';
	if (result.type === 'stop') return [result.entity.locality_name, result.entity.municipality_name].filter(Boolean).join(' | ');
	return [result.entity.street, result.entity.areas?.map(area => area.name).filter(Boolean).slice(0, 2).join(', ')].filter(Boolean).join(' | ');
}

function StopAgencyLogos({ agencyIds }: { agencyIds: string[] }) {
	return (
		<em className={styles.stopAgencyLogos}>
			{agencyIds.map((agencyId) => {
				const agency = AGENCY_NAMES_MAP[agencyId as keyof typeof AGENCY_NAMES_MAP];
				if (!agency) return null;
				return (
					<Image
						key={agencyId}
						alt={agency.full}
						height={24}
						src={getAgencyLogo(agencyId, '120x120', 'light')}
						width={24}
					/>
				);
			})}
		</em>
	);
}
