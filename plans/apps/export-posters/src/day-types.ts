/* * */

import { DayTypesExt } from '@/types.js';

/* * */

export const DAY_TYPES: DayTypesExt[] = [
	//

	{
		day_type_id: 'DT_ESC_DU',
		friday: true,
		monday: true,
		name: 'Escolar | Dias Úteis',
		saturday: false,
		sequence_number: 1,
		sunday: false,
		thursday: true,
		tuesday: true,
		wednesday: true,
	},
	{
		day_type_id: 'DT_ESC_SAB',
		friday: false,
		monday: false,
		name: 'Escolar | Sábados',
		saturday: true,
		sequence_number: 2,
		sunday: false,
		thursday: false,
		tuesday: false,
		wednesday: false,
	},
	{
		day_type_id: 'DT_ESC_DOM',
		friday: false,
		monday: false,
		name: 'Escolar | Domingos e Feriados',
		saturday: false,
		sequence_number: 3,
		sunday: true,
		thursday: false,
		tuesday: false,
		wednesday: false,
	},

	//

	{
		day_type_id: 'DT_FER_DU',
		friday: true,
		monday: true,
		name: 'Férias Escolares | Dias Úteis',
		saturday: false,
		sequence_number: 4,
		sunday: false,
		thursday: true,
		tuesday: true,
		wednesday: true,
	},
	{
		day_type_id: 'DT_FER_SAB',
		friday: false,
		monday: false,
		name: 'Férias Escolares | Sábados',
		saturday: true,
		sequence_number: 5,
		sunday: false,
		thursday: false,
		tuesday: false,
		wednesday: false,
	},
	{
		day_type_id: 'DT_FER_DOM',
		friday: false,
		monday: false,
		name: 'Férias Escolares | Domingos e Feriados',
		saturday: false,
		sequence_number: 6,
		sunday: true,
		thursday: false,
		tuesday: false,
		wednesday: false,
	},

	//

	{
		day_type_id: 'DT_VER_DU',
		friday: true,
		monday: true,
		name: 'Verão | Dias Úteis',
		saturday: false,
		sequence_number: 7,
		sunday: false,
		thursday: true,
		tuesday: true,
		wednesday: true,
	},
	{
		day_type_id: 'DT_VER_SAB',
		friday: false,
		monday: false,
		name: 'Verão | Sábados',
		saturday: true,
		sequence_number: 8,
		sunday: false,
		thursday: false,
		tuesday: false,
		wednesday: false,
	},
	{
		day_type_id: 'DT_VER_DOM',
		friday: false,
		monday: false,
		name: 'Verão | Domingos e Feriados',
		saturday: false,
		sequence_number: 9,
		sunday: true,
		thursday: false,
		tuesday: false,
		wednesday: false,
	},

	//
];
