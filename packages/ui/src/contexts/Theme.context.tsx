'use client';

/* * */

import { useUserOrganization } from '@/hooks/use-user-organization';
import { useUserPreference } from '@/hooks/use-user-preference';
import { useColorScheme } from '@mantine/hooks';
import { IconAB2, IconMoonFilled, IconSunFilled } from '@tabler/icons-react';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';

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
	{ _id: 'dark', icon: <IconMoonFilled />, name: 'Escuro' },
	{ _id: 'light', icon: <IconSunFilled />, name: 'Claro' },
	{ _id: 'system', icon: <IconAB2 />, name: 'Sistema' },
] as const;

export type ModeType = (typeof AVAILABLE_MODES)[number]['_id'];

/* * */

interface ThemeContextState {
	actions: {
		activateMode: (modeId: ModeType) => void
		activateTheme: (themeId: ThemeType) => void
	}
	data: {
		active_mode: ModeType
		active_theme: ThemeType
	}
}

/* * */

const ThemeContext = createContext<ThemeContextState | undefined>(undefined);

export function useThemeContext() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useThemeContext must be used within a ThemeContextProvider');
	}
	return context;
}

/* * */

export const ThemeContextProvider = ({ children }: PropsWithChildren) => {
	//

	//
	// A. Setup variables

	const systemColorScheme = useColorScheme();

	const [activeMode, setActiveMode] = useUserPreference<ModeType>('ui', 'active_mode', 'system');
	const [organization] = useUserOrganization();

	const theme: ThemeType = organization && organization.theme && AVAILABLE_THEMES.some(t => t._id === organization.theme) ? organization.theme as ThemeType : 'ocean';

	const [activeTheme, setActiveTheme] = useUserPreference<ThemeType>('ui', 'active_theme', theme);

	//
	// B. Handle actions

	useEffect(() => {
		// Apply the active mode to the document
		if (typeof document === 'undefined') return;
		if (typeof activeMode !== 'string') return;
		// If the preferred mode is 'system', use the system color scheme...
		if (activeMode === 'system') document.documentElement.setAttribute('data-mode', systemColorScheme);
		// ...otherwise, use the active mode
		else document.documentElement.setAttribute('data-mode', activeMode);
	}, [activeMode, systemColorScheme]);

	useEffect(() => {
		// Apply the active theme to the document
		if (typeof document === 'undefined') return;
		if (typeof activeTheme !== 'string') return;
		document.documentElement.setAttribute('data-theme', activeTheme);
	}, [activeTheme]);

	const activateMode = (modeId: ModeType) => {
		if (!AVAILABLE_MODES.some(t => t._id === modeId)) return;

		if (modeId === 'system') {
			setActiveMode(systemColorScheme);
			document.documentElement.setAttribute('data-mode', systemColorScheme);
			document.documentElement.setAttribute('data-mantine-color-scheme', systemColorScheme);
		}
		else {
			document.documentElement.setAttribute('data-mode', modeId);
			document.documentElement.setAttribute('data-mantine-color-scheme', modeId);
			setActiveMode(modeId);
		}
	};

	const activateTheme = (themeId: ThemeType) => {
		if (!AVAILABLE_THEMES.some(t => t._id === themeId)) return;
		setActiveTheme(themeId);
	};

	//
	// C. Define context value

	const contextValue: ThemeContextState = useMemo(() => ({
		actions: {
			activateMode,
			activateTheme,
		},
		data: {
			active_mode: activeMode,
			active_theme: activeTheme,
		},
	}), [activeTheme, activeMode]);

	//
	// D. Render components

	return (
		<ThemeContext.Provider value={contextValue}>
			{children}
		</ThemeContext.Provider>
	);

	//
};
