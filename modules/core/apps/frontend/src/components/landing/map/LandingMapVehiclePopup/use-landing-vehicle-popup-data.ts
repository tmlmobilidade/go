'use client';

import { type HubV1ApiRoute } from '@tmlmobilidade/go-types-hub';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import useSWR from 'swr';

import { useLandingAgenciesData } from './use-landing-agencies-data';

/* * */

// Only these brands have logos in assets/navegante/agency-logos.
const AGENCY_LOGO_SLUGS: Record<string, string> = {
	'7NTB1': 'fertagus',
	'A2L1N': 'cmet',
	'A3H3M': 'tcb',
	'BNA17': 'cmet',
	'HF16N': 'mobi',
	'IA2N9': 'ml',
	'IA9T6': 'ccfl',
	'KB1F6': 'mts',
	'LA77N': 'cmet',
	'LTP61': 'ttsl',
	'N18KL': 'cp',
	'YA15B': 'cmet',
};

const LANDING_VEHICLE_POPUP_DATA_URL = 'https://go.tmlmobilidade.pt/hub/api/v1/WORLD/network/routes';

/* * */

export function useLandingVehiclePopupData(agencyId: string, routeId: string) {
	//

	//
	// A. Fetch data

	const agencies = useLandingAgenciesData();
	const { data: route } = useSWR<ApiResponse<HubV1ApiRoute>>(`${LANDING_VEHICLE_POPUP_DATA_URL}/${encodeURIComponent(routeId)}`, {
		fetcher: async (url: string) => await fetchApiData<HubV1ApiRoute>({ credentials: 'omit', url }),
	});

	//
	// B. Transform data

	const logoSlug = AGENCY_LOGO_SLUGS[agencyId];

	return {
		agencyLogoSrc: logoSlug ? `/core/assets/navegante/agency-logos/120x120/navegante-agency-logo-${logoSlug}-120x120-light.png` : undefined,
		agencyName: agencies.find(agency => agency._id === agencyId)?.name,
		route: route?.data,
	};

	//
}
