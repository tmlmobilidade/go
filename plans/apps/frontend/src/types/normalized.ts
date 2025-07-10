/* * */

import { Plan } from '@tmlmobilidade/types';

/* * */

export const planValidityStatus = [
	{ label: 'Ativo', value: 'active' },
	{ label: 'Expirado', value: 'expired' },
	{ label: 'Agendado', value: 'upcoming' },
];

export const planValidityStatusValues = planValidityStatus.map(item => item.value);

/* * */

export interface PlanNormalized extends Plan {
	agency_id_normalized: string
	agency_name_normalized: string
	validity_status: typeof planValidityStatusValues[number]
}
