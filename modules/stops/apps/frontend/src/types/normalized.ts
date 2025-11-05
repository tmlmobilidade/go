/* * */

import { type Stop } from '@go/types';

/* * */

export interface StopNormalized extends Stop {
	district_name: string
	locality_name: string
	municipality_name: string
	name_normalized: string
	new_name_normalized: string
	parish_name: string
}
