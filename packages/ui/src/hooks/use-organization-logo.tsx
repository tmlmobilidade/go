'use client';

/* * */

import { getModuleConfig, HttpException } from '@tmlmobilidade/consts';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface GetLogoSchema {
	logo_dark: null | string
	logo_light: null | string
}

/**
 * A hook to get organization logo as state.
 * @returns The current organization logo value.
 */

export function useOrganizationLogo(organization_id: string): null | string | undefined {
	//

	//
	// A. Setup variables

	const theme = document.documentElement.getAttribute('data-mode');

	//
	// B. Fetch data

	const { data, error, isLoading } = useSWR<GetLogoSchema, HttpException>(`${getModuleConfig('auth', 'api_url')}/organizations/${organization_id}/logo`);

	//
	// C. Handle actions

	const themeLogo = useMemo(() => {
		if (!data || isLoading || error || !theme) return undefined;
		return theme === 'dark' ? data.logo_dark : data.logo_light;
	}, [data, isLoading, error, theme]);

	//
	// D. Render components

	return themeLogo;

	//
}
