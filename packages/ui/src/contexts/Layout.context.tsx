'use client';

import { useColorScheme } from '@mantine/hooks';
import { IconAB2, IconMoonFilled, IconSunFilled } from '@tabler/icons-react';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';

import { useFullscreenState } from '../hooks/use-fullscreen-state';
import { useUserOrganization } from '../hooks/use-user-organization';
import { useUserPreference } from '../hooks/use-user-preference';

/* * */

export const AVAILABLE_THEMES = [
	{ _id: 'ocean', name: 'Ocean', primary_color: 'var(--theme-ocean-color-primary)' },
	{ _id: 'park', name: 'Park', primary_color: 'var(--theme-park-color-primary)' },
	{ _id: 'path', name: 'Path', primary_color: 'var(--theme-path-color-primary)' },
	{ _id: 'pool', name: 'Pool', primary_color: 'var(--theme-pool-color-primary)' },
	{ _id: 'royal', name: 'Royal', primary_color: 'var(--theme-royal-color-primary)' },
	{ _id: 'street', name: 'Street', primary_color: 'var(--theme-street-color-primary)' },
] as const;

export type ThemeType = (typeof AVAILABLE_THEMES)[number]['_id'];

/* * */

export const AVAILABLE_MODES = [
	{ _id: 'light', icon: <IconSunFilled size={20} />, name: 'Claro' },
	{ _id: 'dark', icon: <IconMoonFilled size={20} />, name: 'Escuro' },
	{ _id: 'system', icon: <IconAB2 size={20} />, name: 'Sistema' },
] as const;

export type ModeType = (typeof AVAILABLE_MODES)[number]['_id'];

/* * */

interface LayoutContextState {
	actions: {
		activateFullscreen: () => void
		activateMode: (modeId: ModeType) => void
		activateTheme: (themeId: ThemeType) => void
	}
	data: {
		active_fullscreen: boolean
		active_mode: ModeType
		active_theme: ThemeType
	}
}

/* * */

const LayoutContext = createContext<LayoutContextState | undefined>(undefined);

export function useLayoutContext() {
	const context = useContext(LayoutContext);
	if (!context) {
		throw new Error('useLayoutContext must be used within a LayoutContextProvider');
	}
	return context;
}

/* * */

export const LayoutContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const systemColorScheme = useColorScheme();

	const [userOrganization] = useUserOrganization();

	const defaultTheme: ThemeType = userOrganization && userOrganization.theme && AVAILABLE_THEMES.some(t => t._id === userOrganization.theme) ? userOrganization.theme as ThemeType : 'ocean';

	const [activeFullscreen, setActiveFullscreen] = useFullscreenState();
	const [activeTheme, setActiveTheme] = useUserPreference<ThemeType>('ui', 'active_theme', defaultTheme);
	const [activeMode, setActiveMode] = useUserPreference<ModeType>('ui', 'active_mode', 'system');

	//
	// B. Transform data

	useEffect(() => {
		// Skip if document is unavailable (SSR)
		if (typeof document === 'undefined') return;
		// If active mode is system, set it to system color scheme
		if (activeMode === 'system') {
			document.documentElement.setAttribute('data-mode', systemColorScheme);
			document.documentElement.setAttribute('data-mantine-color-scheme', systemColorScheme);
			return;
		}
		// Otherwise, set it to active mode
		document.documentElement.setAttribute('data-mode', activeMode);
		document.documentElement.setAttribute('data-mantine-color-scheme', activeMode);
	}, [activeMode, systemColorScheme]);

	useEffect(() => {
		// Skip if document is unavailable (SSR)
		if (typeof document === 'undefined') return;
		if (typeof activeTheme !== 'string') return;
		// Apply the active theme to the document
		document.documentElement.setAttribute('data-theme', activeTheme);
	}, [activeTheme]);

	useEffect(() => {
		// Skip if document is unavailable (SSR)
		if (typeof document === 'undefined') return;
		// Apply the fullscreen state to the document
		document.documentElement.setAttribute('data-fullscreen', activeFullscreen ? 'true' : 'false');
	}, [activeFullscreen]);

	//
	// C. Handle actions

	const activateMode = (modeId: ModeType) => {
		if (!AVAILABLE_MODES.some(t => t._id === modeId)) return;
		setActiveMode(modeId);
	};

	const activateTheme = (themeId: ThemeType) => {
		if (!AVAILABLE_THEMES.some(t => t._id === themeId)) return;
		setActiveTheme(themeId);
	};

	const activateFullscreen = () => {
		setActiveFullscreen();
	};

	//
	// D. Define context value

	const contextValue: LayoutContextState = useMemo(() => ({
		actions: {
			activateFullscreen,
			activateMode,
			activateTheme,
		},
		data: {
			active_fullscreen: activeFullscreen,
			active_mode: activeMode,
			active_theme: activeTheme,
		},
	}), [
		activeFullscreen,
		activeMode,
		activeTheme,
	]);

	//
	// E. Render components

	return (
		<LayoutContext.Provider value={contextValue}>
			{children}
		</LayoutContext.Provider>
	);

	//
};
