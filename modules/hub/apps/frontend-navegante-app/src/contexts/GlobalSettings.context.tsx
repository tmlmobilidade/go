'use client';

import { nextTransportsAfterToggle, normalizeTransportsSelection } from '@/utils/transportAgencies';
import { useLocalStorage } from '@mantine/hooks';
import { createContext, useContext } from 'react';

/* * */

export type Section = 'alerts' | 'lines' | 'stops' | 'vehicles';
export type TransportOption = 'boat' | 'bus' | 'metro' | 'train';

/* * */

interface GlobalSettingsState {
	actions: {
		toggleTransportOption: (key: 'all' | TransportOption) => void
		updateFilterbar: (value: Partial<GlobalSettingsState['filterbar']>) => void
		updateFilterByAgency: (values: string[]) => void
		updateSection: (value: Section) => void
		updateTransports: (values: TransportOption[]) => void
	}
	filterbar: {
		by_agency: string[]
		search: string
		transports: TransportOption[]
	}
	section: Section
}

interface GlobalSettingsStorage {
	filterbar: {
		by_agency: string[]
		search: string
		transports: TransportOption[]
	}
	section: Section
}

/* * */

const GlobalSettingsContext = createContext<GlobalSettingsState | undefined>(undefined);

export function useGlobalSettingsContext() {
	const context = useContext(GlobalSettingsContext);
	if (!context) {
		throw new Error('useGlobalSettingsContext must be used within GlobalSettingsContext');
	}
	return context;
}

/* * */

export const GlobalSettingsContextProvider = ({ children }) => {
	//

	//
	// A. Setup Variables

	const [settings, setSettings] = useLocalStorage<GlobalSettingsStorage>({
		defaultValue: {
			filterbar: {
				by_agency: [],
				search: '',
				transports: [],
			},
			section: 'lines',
		},
		key: 'global-settings',
	});

	//
	// B. Handle Actions

	const updateSection = (value: Section) => {
		setSettings(prev => ({
			...prev,
			section: value,
		}));
	};

	const updateFilterbar = (value: Partial<GlobalSettingsState['filterbar']>) => {
		setSettings(prev => ({
			...prev,
			filterbar: {
				...prev.filterbar,
				...value,
			},
		}));
	};

	const updateTransports = (values: TransportOption[]) => {
		setSettings(prev => ({
			...prev,
			filterbar: {
				...prev.filterbar,
				transports: normalizeTransportsSelection(values),
			},
		}));
	};

	const toggleTransportOption = (key: 'all' | TransportOption) => {
		setSettings(prev => ({
			...prev,
			filterbar: {
				...prev.filterbar,
				transports: nextTransportsAfterToggle(prev.filterbar.transports ?? [], key),
			},
		}));
	};

	const updateFilterByAgency = (values: string[]) => {
		const sorted = [...values].sort((a, b) => a.localeCompare(b));
		setSettings(prev => ({
			...prev,
			filterbar: {
				...prev.filterbar,
				by_agency: sorted,
			},
		}));
	};

	//
	// C. Context value

	const contextValue: GlobalSettingsState = {
		actions: {
			toggleTransportOption,
			updateFilterbar,
			updateFilterByAgency,
			updateSection,
			updateTransports,
		},
		filterbar: {
			by_agency: settings.filterbar.by_agency ?? [],
			search: settings.filterbar.search ?? '',
			transports: normalizeTransportsSelection(settings.filterbar.transports ?? []),
		},
		section: settings.section,
	};

	//
	// D. Render Components

	return (
		<GlobalSettingsContext.Provider value={contextValue}>
			{children}
		</GlobalSettingsContext.Provider>
	);

	//
};
