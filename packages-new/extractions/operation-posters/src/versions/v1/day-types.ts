/* * */

import { type DayTypeConfig } from './types/day-type-config.js';

/* * */

export const DAY_TYPES: DayTypeConfig[] = [
	{
		_id: 'DT_DU',
		day_type: '1',
		index: 1,
		name: 'Dias Úteis',
	},
	{
		_id: 'DT_SAB',
		day_type: '2',
		index: 2,
		name: 'Sábados',
	},
	{
		_id: 'DT_DOM',
		day_type: '3',
		index: 3,
		name: 'Domingos e Feriados',
	},
];
