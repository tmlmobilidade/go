/* * */

import { DEFAULT_NUMBER_ANIMATION_CONFIG } from '../types/number-animation';

/* * */

export const AGENCY_INFO = Object.freeze({
	A2L1N: {
		agency_id: 'A2L1N',
		logo_slug: 'cmet',
		name: 'ALSA Todi',
		short_name: 'ALSA',
	},
	BNA17: {
		agency_id: 'BNA17',
		logo_slug: 'cmet',
		name: 'Rodoviária de Lisboa',
		short_name: 'RL',
	},
	CM: {
		agency_id: 'CM',
		logo_slug: 'cmet',
		name: 'Carris Metropolitana',
		short_name: 'CM',
	},
	IA9T6: {
		agency_id: 'IA9T6',
		logo_slug: 'ccfl',
		name: 'Carris',
		short_name: 'CCFL',
	},
	LA77N: {
		agency_id: 'LA77N',
		logo_slug: 'cmet',
		name: 'Viação Alvorada',
		short_name: 'VA',
	},
	LTP61: {
		agency_id: 'LTP61',
		logo_slug: 'ttsl',
		name: 'Transtejo Soflusa',
		short_name: 'TTSL',
	},
	YA15B: {
		agency_id: 'YA15B',
		logo_slug: 'cmet',
		name: 'Transportes Sul do Tejo',
		short_name: 'TST',
	},
} as const);

export type AgencyId = keyof typeof AGENCY_INFO;
export type AgencyInfo = (typeof AGENCY_INFO)[AgencyId];

/* * */

export const AGENCY_ROUTE_CONFIG = {
	41: {
		...AGENCY_INFO.LA77N,
		area_number: 1,
		number_animation: DEFAULT_NUMBER_ANIMATION_CONFIG,
	},
	42: {
		...AGENCY_INFO.BNA17,
		area_number: 2,
		number_animation: DEFAULT_NUMBER_ANIMATION_CONFIG,
	},
	43: {
		...AGENCY_INFO.YA15B,
		area_number: 3,
		number_animation: DEFAULT_NUMBER_ANIMATION_CONFIG,
	},
	44: {
		...AGENCY_INFO.A2L1N,
		area_number: 4,
		number_animation: DEFAULT_NUMBER_ANIMATION_CONFIG,
	},
	ccfl: {
		...AGENCY_INFO.IA9T6,
		number_animation: DEFAULT_NUMBER_ANIMATION_CONFIG,
	},
	cm: {
		...AGENCY_INFO.CM,
		number_animation: DEFAULT_NUMBER_ANIMATION_CONFIG,
	},
	ttsl: {
		...AGENCY_INFO.LTP61,
		number_animation: DEFAULT_NUMBER_ANIMATION_CONFIG,
	},
} as const;
