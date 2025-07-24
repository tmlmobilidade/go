/* * */

import { type Stop, type Validation } from '@tmlmobilidade/types';

/* * */

export interface StopNormalized extends Stop {
	agency_id_normalized: string
	agency_name_normalized: string
}

/* * */

export interface ValidationNormalized extends Validation {
	agency_id_normalized: string
	agency_name_normalized: string
}
