/* * */

import { type Plan, ProcessingStatus, type Validation } from '@tmlmobilidade/types';

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

/* * */

export const validationProcessingStatusValues = Object.values(ProcessingStatus);

export const validationProcessingStatus = validationProcessingStatusValues.map((item) => {
	if (item === ProcessingStatus.Complete) return { label: 'Válido', value: item };
	if (item === ProcessingStatus.Error) return { label: 'Erro', value: item };
	if (item === ProcessingStatus.Processing) return { label: 'Em Análise', value: item };
	if (item === ProcessingStatus.Waiting) return { label: 'Em Espera', value: item };
	return { label: 'Desconhecido', value: item };
});

/* * */

export interface ValidationNormalized extends Validation {
	agency_id_normalized: string
	agency_name_normalized: string
}
