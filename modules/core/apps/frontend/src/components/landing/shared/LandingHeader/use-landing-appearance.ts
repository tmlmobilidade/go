'use client';

import { type ThemeType, useColorScheme } from '@tmlmobilidade/ui';
import { useEffect, useMemo, useState } from 'react';

/* * */

export type LandingAppearanceMode = 'dark' | 'light' | 'system';

export interface UseLandingAppearanceReturnType {
	mode: LandingAppearanceMode
	resolvedMode: 'dark' | 'light'
	setMode: (mode: LandingAppearanceMode) => void
	setTheme: (theme: ThemeType) => void
	theme: ThemeType
}

/* * */

export function useLandingAppearance(): UseLandingAppearanceReturnType {
	//
	// A. Setup variables

	const systemMode = useColorScheme();
	const [mode, setMode] = useState<LandingAppearanceMode>('system');
	const [theme, setTheme] = useState<ThemeType>('ocean');
	const resolvedMode = mode === 'system' ? systemMode : mode;

	//
	// B. Apply appearance

	useEffect(() => {
		document.documentElement.setAttribute('data-mode', resolvedMode);
		document.documentElement.setAttribute('data-mantine-color-scheme', resolvedMode);
	}, [resolvedMode]);

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme);
	}, [theme]);

	//
	// C. Return state

	return useMemo(() => ({ mode, resolvedMode, setMode, setTheme, theme }), [mode, resolvedMode, theme]);
}
