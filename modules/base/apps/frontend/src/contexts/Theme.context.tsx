'use client';

/* * */

import { IconAB2, IconMoonFilled, IconSunFilled } from '@tabler/icons-react';
import { createContext, type PropsWithChildren, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

/* * */

export type ModeType = 'dark' | 'light' | 'system';

export const AVAILABLE_MODES: { _id: ModeType, icon: ReactNode, name: string }[] = [
	{ _id: 'light', icon: <IconSunFilled size={20} />, name: 'Claro' },
	{ _id: 'dark', icon: <IconMoonFilled size={20} />, name: 'Escuro' },
	{ _id: 'system', icon: <IconAB2 size={20} />, name: 'Sistema' },
];

/* * */

const MODE_STORAGE_KEY = 'go.base.mode';
const DEFAULT_MODE: ModeType = 'system';

/* * */

interface ThemeContextState {
	actions: {
		setMode: (mode: ModeType) => void
	}
	data: {
		active_mode: ModeType
		resolved_mode: 'dark' | 'light'
	}
}

const ThemeContext = createContext<ThemeContextState | undefined>(undefined);

/* * */

function resolveSystemMode(): 'dark' | 'light' {
	if (typeof window === 'undefined') return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/* * */

export function useThemeContext() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useThemeContext must be used within a ThemeContextProvider');
	}
	return context;
}

export function ThemeContextProvider({ children }: PropsWithChildren) {
	//
	const [activeMode, setActiveMode] = useState<ModeType>(DEFAULT_MODE);
	const [systemMode, setSystemMode] = useState<'dark' | 'light'>('light');

	useEffect(() => {
		const storedMode = localStorage.getItem(MODE_STORAGE_KEY) as ModeType | null;
		if (storedMode && ['dark', 'light', 'system'].includes(storedMode)) {
			setActiveMode(storedMode);
		}
		setSystemMode(resolveSystemMode());
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = (event: MediaQueryListEvent) => setSystemMode(event.matches ? 'dark' : 'light');
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	}, []);

	const resolvedMode: 'dark' | 'light' = activeMode === 'system' ? systemMode : activeMode;

	useEffect(() => {
		if (typeof document === 'undefined') return;
		document.documentElement.setAttribute('data-mode', resolvedMode);
		document.documentElement.setAttribute('data-mantine-color-scheme', resolvedMode);
	}, [resolvedMode]);

	const setMode = (mode: ModeType) => {
		setActiveMode(mode);
		localStorage.setItem(MODE_STORAGE_KEY, mode);
	};

	const contextValue: ThemeContextState = useMemo(() => ({
		actions: { setMode },
		data: {
			active_mode: activeMode,
			resolved_mode: resolvedMode,
		},
	}), [activeMode, resolvedMode]);

	return (
		<ThemeContext.Provider value={contextValue}>
			{children}
		</ThemeContext.Provider>
	);
}
