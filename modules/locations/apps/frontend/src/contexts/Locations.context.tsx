'use client';

import { useMapOptionsContext } from '@/components/map/MapOptions.context';
import { type Location } from '@tmlmobilidade/types';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

/* * */

interface SelectedLocations {
	district: null | string
	locality: null | string
	municipality: null | string
	parish: null | string
}

interface LocationsContextState {
	actions: {
		handleSearch: () => Promise<void>
		setCoordinates: (coordinates: [number, number]) => void
		setSelectedLocation: (type: string, value: null | string) => void
		toggleFilter: (filter: string) => void
	}
	data: {
		coordinates: [number, number]
		filterOut: string[]
		location: Location | null
		selectedLocations: SelectedLocations
	}
	flags: {
		error: null | string
		isLoading: boolean
	}
}

/* * */

const LocationsContext = createContext<LocationsContextState | undefined>(undefined);

export const useLocationsContext = () => {
	const context = useContext(LocationsContext);
	if (!context) {
		throw new Error('useLocationsContext must be used within a LocationsContextProvider');
	}
	return context;
};

/* * */

export const LocationsContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup state

	const [location, setLocation] = useState<Location | null>(null);
	const [coordinates, setCoordinates] = useState<[number, number]>([-8.7486622, 38.6625867]);
	const [filterOut, setFilterOut] = useState<string[]>([]);
	const [selectedLocations, setSelectedLocations] = useState<SelectedLocations>({
		district: null,
		locality: null,
		municipality: null,
		parish: null,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<null | string>(null);

	const mapOptionsContext = useMapOptionsContext();

	//
	// B. Handle effects

	// Update selected locations when location data changes (after search)
	useEffect(() => {
		if (location) {
			setSelectedLocations({
				district: location.district.name || null,
				locality: location.locality.name || null,
				municipality: location.municipality.name || null,
				parish: location.parish.name || null,
			});

			// Center map on district initially when new location is loaded
			if (location.district && mapOptionsContext?.data?.map) {
				setTimeout(() => {
					mapOptionsContext.actions.centerMap('district');
				}, 100);
			}
		}
	}, [location, mapOptionsContext?.data?.map]);

	// Center map when selected location changes manually
	useEffect(() => {
		if (!mapOptionsContext?.data?.map || !location) return;

		// Find the most specific selected location and center on it
		const locationPriority = ['locality', 'parish', 'municipality', 'district'] as const;

		for (const locationType of locationPriority) {
			if (selectedLocations[locationType] && location[locationType]) {
				// Only center if this location matches the selected name
				const locationName = location[locationType]?.name;
				if (locationName === selectedLocations[locationType]) {
					setTimeout(() => {
						mapOptionsContext.actions.centerMap(locationType);
					}, 100);
					break;
				}
			}
		}
	}, [selectedLocations, mapOptionsContext?.data?.map, location]);

	//
	// C. Define actions

	const handleSearch = async () => {
		setIsLoading(true);
		setError(null);

		// Clear previous selections
		setSelectedLocations({
			district: null,
			locality: null,
			municipality: null,
			parish: null,
		});

		try {
			const response = await fetch(`/api/coordinates?lon=${coordinates[0]}&lat=${coordinates[1]}`);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			setLocation(data);
		}
		catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching location data';
			setError(errorMessage);
		}
		finally {
			setIsLoading(false);
		}
	};

	const setSelectedLocation = (type: keyof SelectedLocations, value: null | string) => {
		setSelectedLocations(prev => ({
			...prev,
			[type]: value,
		}));
	};

	const toggleFilter = (filter: string) => {
		setFilterOut(prevFilters =>
			prevFilters.includes(filter)
				? prevFilters.filter(f => f !== filter)
				: [...prevFilters, filter],
		);
	};

	//
	// D. Define context value

	const contextValue: LocationsContextState = useMemo(() => ({
		actions: {
			handleSearch,
			setCoordinates,
			setSelectedLocation,
			toggleFilter,
		},
		data: {
			coordinates,
			filterOut,
			location,
			selectedLocations,
		},
		flags: {
			error,
			isLoading,
		},
	}), [location, coordinates, filterOut, selectedLocations, isLoading, error]);

	//
	// E. Render components

	return (
		<LocationsContext.Provider value={contextValue}>
			{children}
		</LocationsContext.Provider>
	);

	//
};
