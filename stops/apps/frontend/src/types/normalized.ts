/* * */

import { type Stop, type Validation } from '@tmlmobilidade/types';

/* * */

export interface StopNormalized extends Stop {
	id_normalized: string
	name_normalized: string
}

/* * */

export interface ValidationNormalized extends Validation {
	id_normalized: string
	name_normalized: string
}
