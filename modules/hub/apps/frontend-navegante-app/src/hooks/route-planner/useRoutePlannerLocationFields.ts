'use client';

import { type RoutePlannerLocation } from '@/types/route-planner';
import { createRoutePlannerCurrentLocation } from '@/utils/route-planner/locations';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMotisLocationSearch } from './useMotisLocationSearch';

/* * */

interface UseRoutePlannerLocationFieldsParams {
	destination: null | RoutePlannerLocation
	onDestinationChange: (location: null | RoutePlannerLocation) => void
	onOriginChange: (location: null | RoutePlannerLocation) => void
	origin: null | RoutePlannerLocation
}

/* * */

const CURRENT_LOCATION_OPTION_ID = '__current_location__';

/* * */

export function useRoutePlannerLocationFields({ destination, onDestinationChange, onOriginChange, origin }: UseRoutePlannerLocationFieldsParams) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const [activeField, setActiveField] = useState<'destination' | 'origin' | null>(null);
	const [destinationQuery, setDestinationQuery] = useState('');
	const [originQuery, setOriginQuery] = useState('');
	const originSearch = useMotisLocationSearch(originQuery);
	const destinationSearch = useMotisLocationSearch(destinationQuery);

	//
	// B. Transform data

	useEffect(() => {
		if (origin) setOriginQuery(origin.label);
	}, [origin]);

	useEffect(() => {
		if (destination) setDestinationQuery(destination.label);
	}, [destination]);

	const currentLocationOption = useMemo<RoutePlannerLocation>(() => ({
		detail: t('default:routes.RoutePlannerSearch.origin.current_location_detail'),
		id: CURRENT_LOCATION_OPTION_ID,
		label: t('default:routes.RoutePlannerSearch.origin.current_location'),
		type: 'PLACE',
	}), [t]);

	const isCurrentLocationOrigin = origin?.label === currentLocationOption.label;
	const originSearchData = useMemo(() => {
		if (isCurrentLocationOrigin) return originSearch.data;
		return [currentLocationOption, ...originSearch.data.filter(location => location.id !== CURRENT_LOCATION_OPTION_ID)];
	}, [currentLocationOption, isCurrentLocationOrigin, originSearch.data]);

	//
	// C. Handle actions

	const handleOriginLocationClick = () => {
		handleCurrentLocationSelect(onOriginChange, setOriginQuery, currentLocationOption.label, currentLocationOption.detail);
	};

	const handleOriginQueryChange = (value: string) => {
		setOriginQuery(value);
		onOriginChange(null);
		setActiveField('origin');
	};

	const handleDestinationQueryChange = (value: string) => {
		setDestinationQuery(value);
		onDestinationChange(null);
		setActiveField('destination');
	};

	const handleOriginSelect = (location: RoutePlannerLocation) => {
		if (location.id === CURRENT_LOCATION_OPTION_ID) {
			handleOriginLocationClick();
			setActiveField(null);
			return;
		}

		onOriginChange(location);
		setOriginQuery(location.label);
		setActiveField(null);
	};

	const handleDestinationSelect = (location: RoutePlannerLocation) => {
		onDestinationChange(location);
		setDestinationQuery(location.label);
		setActiveField(null);
	};

	return {
		activeField,
		destinationQuery,
		destinationSearch,
		handleDestinationQueryChange,
		handleDestinationSelect,
		handleOriginLocationClick,
		handleOriginQueryChange,
		handleOriginSelect,
		isCurrentLocationOrigin,
		originQuery,
		originSearch,
		originSearchData,
		setActiveField,
	};

	//
}

/* * */

function handleCurrentLocationSelect(
	onChange: (location: RoutePlannerLocation) => void,
	setQuery: (query: string) => void,
	label: string,
	detail: string,
) {
	if (typeof navigator === 'undefined' || !navigator.geolocation) return;

	navigator.geolocation.getCurrentPosition((position) => {
		const location = createRoutePlannerCurrentLocation({
			detail,
			label,
			latitude: position.coords.latitude,
			longitude: position.coords.longitude,
		});
		if (!location) return;

		onChange(location);
		setQuery(label);
	});
}
