/* * */

import { DEFAULT_NUMBER_ANIMATION_CONFIG } from '../types/number-animation';

/* * */

export const AGENCY_ROUTE_CONFIG = {
	41: {
		agency_id: 'LA77N',
		area_number: 1,
		label: 'VA',
		name: 'Viação Alvorada',
		number_animation: DEFAULT_NUMBER_ANIMATION_CONFIG,
	},
	42: {
		agency_id: 'BNA17',
		area_number: 2,
		label: 'RL',
		name: 'Rodoviária de Lisboa',
		number_animation: DEFAULT_NUMBER_ANIMATION_CONFIG,
	},
	43: {
		agency_id: 'YA15B',
		area_number: 3,
		label: 'TST',
		name: 'Transportes Sul do Tejo',
		number_animation: DEFAULT_NUMBER_ANIMATION_CONFIG,
	},
	44: {
		agency_id: 'A2L1N',
		area_number: 4,
		label: 'ALSA',
		name: 'ALSA Todi',
		number_animation: DEFAULT_NUMBER_ANIMATION_CONFIG,
	},
	ccfl: {
		agency_id: 'IA9T6',
		label: 'CCFL',
		name: 'Carris',
		number_animation: DEFAULT_NUMBER_ANIMATION_CONFIG,
	},
	cm: {
		label: 'CM',
		number_animation: DEFAULT_NUMBER_ANIMATION_CONFIG,
	},
} as const;
