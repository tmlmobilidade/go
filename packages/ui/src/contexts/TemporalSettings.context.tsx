'use client';

import { type TimezoneIdentified } from '@tmlmobilidade/dates';
import { createContext, type PropsWithChildren, useContext } from 'react';

/* * */

export interface TemporalSettings {
	locale: string
	operationalDayStartHour: number
	timezone: TimezoneIdentified
}

export interface TemporalSettingsContextProviderProps {
	settings: TemporalSettings
}

/* * */

const TemporalSettingsContext = createContext<TemporalSettings | undefined>(undefined);

export function useTemporalSettingsContext() {
	const context = useContext(TemporalSettingsContext);
	if (!context) {
		throw new Error('useTemporalSettingsContext must be used within a TemporalSettingsContextProvider');
	}
	return context;
}

/* * */

export function TemporalSettingsContextProvider({ children, settings }: PropsWithChildren<TemporalSettingsContextProviderProps>) {
	//

	//
	// F. Render components

	return (
		<TemporalSettingsContext.Provider value={settings}>
			{children}
		</TemporalSettingsContext.Provider>
	);

	//
}
