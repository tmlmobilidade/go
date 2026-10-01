'use client';

import { useColorScheme } from '@mantine/hooks';
import { ThemeMode, type ThemeModePreference } from '@tmlmobilidade/go-types-shared';
import { useMemo } from 'react';

import { useUserPreference } from '../../hooks';

/**
 * A custom hook to get the current theme mode.
 * @returns The current URL.
 */
export function useCurrentThemeMode(): ThemeMode {
	//

	//
	// A. Setup variables

	const systemColorScheme = useColorScheme();

	const [userThemeModePreference] = useUserPreference<ThemeModePreference>('ui', 'active_mode', 'system');

	//
	// B. Transform data

	const activeThemeMode = useMemo(() => {
		// If active mode is system, set it to system color scheme
		if (userThemeModePreference === 'system') return systemColorScheme;
		return userThemeModePreference;
	}, [userThemeModePreference, systemColorScheme]);

	//
	// C. Render components

	return activeThemeMode;
}
