/* * */

import { Plan } from '@tmlmobilidade/types';

/* * */

export interface PlanNormalized extends Plan {
	agency_id_normalized: string
	agency_name_normalized: string
}
