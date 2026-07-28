/* * */

import { DEFAULT_NUMBER_ANIMATION_CONFIG } from '../types/number-animation';

/* * */

export const AGENCY_ROUTE_CONFIG = {
	41: {
		agency_id: 'LA77N',
		label: 'VA',
		number_animation: DEFAULT_NUMBER_ANIMATION_CONFIG,
	},
	42: {
		agency_id: 'BNA17',
		label: 'RL',
		number_animation: DEFAULT_NUMBER_ANIMATION_CONFIG,
	},
	43: {
		agency_id: 'YA15B',
		label: 'TST',
		number_animation: DEFAULT_NUMBER_ANIMATION_CONFIG,
	},
	44: {
		agency_id: 'A2L1N',
		label: 'ALSA',
		number_animation: DEFAULT_NUMBER_ANIMATION_CONFIG,
	},
	ccfl: {
		agency_id: 'IA9T6',
		label: 'CCFL',
		number_animation: DEFAULT_NUMBER_ANIMATION_CONFIG,
	},
	cm: {
		label: 'CM',
		number_animation: DEFAULT_NUMBER_ANIMATION_CONFIG,
	},
} as const;
