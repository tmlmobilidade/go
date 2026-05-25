'use client';

import { useLocalStorage } from '@mantine/hooks';
import { createContext, useContext } from 'react';

/* * */

export type Section = 'alerts' | 'lines' | 'stops' | 'vehicles';
export type TransportOption = 'boat' | 'bus' | 'metro' | 'train';

export const TRANSPORT_AGENCY_IDS: Record<TransportOption, string[]> = {
	boat: ['4', '15'],
	bus: ['8', '21', '41', '42', '43', '44'],
	metro: ['2', '16'],
	train: ['1', '3'],
};

export const ALL_TRANSPORT_OPTIONS = Object.keys(TRANSPORT_AGENCY_IDS) as TransportOption[];

export const AGENCY_ID_TO_TRANSPORT: Record<string, TransportOption> = Object.entries(TRANSPORT_AGENCY_IDS).reduce<Record<string, TransportOption>>((acc, [transport, ids]) => {
	ids.forEach((id) => {
		acc[id] = transport as TransportOption;
	});
	return acc;
}, {});

export function transportsSelectionIsAll(transports: TransportOption[]): boolean {
	if (transports.length === 0) return true;
	if (transports.length !== ALL_TRANSPORT_OPTIONS.length) return false;
	return ALL_TRANSPORT_OPTIONS.every(mode => transports.includes(mode));
}

export function normalizeTransportsSelection(values: TransportOption[]): TransportOption[] {
	const unique = [...new Set(values)];
	if (transportsSelectionIsAll(unique)) return [];
	return [...unique].sort((a, b) => ALL_TRANSPORT_OPTIONS.indexOf(a) - ALL_TRANSPORT_OPTIONS.indexOf(b));
}

export function nextTransportsAfterToggle(prevList: TransportOption[], key: 'all' | TransportOption): TransportOption[] {
	if (key === 'all') return [];
	const current = normalizeTransportsSelection(prevList);
	if (transportsSelectionIsAll(current)) return [key];
	const next = new Set(current);
	if (next.has(key)) next.delete(key);
	else next.add(key);
	return normalizeTransportsSelection([...next]);
}

export function agencyMatchesTransports(agencyId: string | undefined, transports: TransportOption[]): boolean {
	if (transportsSelectionIsAll(transports)) return true;
	if (!agencyId) return false;
	return transports.some(transport => TRANSPORT_AGENCY_IDS[transport].includes(agencyId));
}

export function agencyMatchesSelection(agencyId: string | undefined, selectedAgencyIds: string[]): boolean {
	if (selectedAgencyIds.length === 0) return true;
	if (!agencyId) return false;
	return selectedAgencyIds.some(selectedId => selectedId === agencyId);
}

export function matchesGlobalAgencyTransportFilters(agencyId: string | undefined, filterByAgency: string[], filterByTransports: TransportOption[]) {
	return agencyMatchesSelection(agencyId, filterByAgency) && agencyMatchesTransports(agencyId, filterByTransports);
}

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
		getInitialValueInEffect: true,
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
