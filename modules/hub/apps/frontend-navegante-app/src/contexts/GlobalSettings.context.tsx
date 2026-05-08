'use client';

import { useLocalStorage } from '@mantine/hooks';
import { createContext, useContext, useEffect, useRef } from 'react';

/* * */

export type Section = 'alerts' | 'lines' | 'stops' | 'vehicles';
export type TransportOption = 'boat' | 'bus' | 'metro' | 'train';

/* * */

interface GlobalSettingsState {
	actions: {
		updateFilterbar: (value: Partial<GlobalSettingsState['filterbar']>) => void
		updateFilterByAgency: (values: string[]) => void
		updateSection: (value: Section) => void
		updateToolbar: (value: Partial<GlobalSettingsState['toolbar']>) => void
		updateTransports: (values: TransportOption[]) => void
	}
	filterbar: {
		by_agency: string[]
		search: string
		transports: TransportOption[]
	}
	section: Section
	toolbar: {
		view: 'list' | 'map'
	}
}

interface GlobalSettingsStorage {
	filterbar: {
		by_agency: string[]
		search: string
		transports: TransportOption[]
	}
	section: Section
	toolbar: {
		view: 'list' | 'map'
	}
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

	const [settings, setSettings] = useLocalStorage<GlobalSettingsStorage>({
		defaultValue: {
			filterbar: {
				by_agency: [],
				search: '',
				transports: [],
			},
			section: 'lines',
			toolbar: {
				view: 'list',
			},
		},
		key: 'global-settings',
	});

	const initialized = useRef(false);

	//
	// Hydrate from URL

	// useEffect(() => {
	// 	if (initialized.current) return;

	// 	const sectionFromUrl = searchParams.get('section') as null | Section;

	// 	if (sectionFromUrl) {
	// 		setSettings(prev => ({
	// 			...prev,
	// 			section: sectionFromUrl,
	// 		}));
	// 	}

	// 	initialized.current = true;
	// }, [searchParams, setSettings]);

	//
	// Sync to URL

	useEffect(() => {
		if (!initialized.current) return;

		const url = new URL(window.location.href);

		if (settings.section === 'lines') {
			url.searchParams.delete('section');
		} else {
			url.searchParams.set('section', settings.section);
		}

		window.history.replaceState({}, '', url);
	}, [settings.section]);

	//
	// Actions

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

	const updateToolbar = (value: Partial<GlobalSettingsState['toolbar']>) => {
		setSettings(prev => ({
			...prev,
			toolbar: {
				...prev.toolbar,
				...value,
			},
		}));
	};

	const updateTransports = (values: TransportOption[]) => {
		setSettings(prev => ({
			...prev,
			filterbar: {
				...prev.filterbar,
				transports: values,
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
	// Context value

	const contextValue: GlobalSettingsState = {
		actions: {
			updateFilterbar,
			updateFilterByAgency,
			updateSection,
			updateToolbar,
			updateTransports,
		},
		filterbar: {
			by_agency: settings.filterbar.by_agency ?? [],
			search: settings.filterbar.search ?? '',
			transports: settings.filterbar.transports ?? [],
		},
		section: settings.section,
		toolbar: settings.toolbar,
	};

	//
	// Render

	return (
		<GlobalSettingsContext.Provider value={contextValue}>
			{children}
		</GlobalSettingsContext.Provider>
	);
};
