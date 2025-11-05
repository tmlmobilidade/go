/* * */

import { type GtfsValidation, type Plan, PROCESSING_STATUS_OPTIONS } from '@tmlmobilidade/go-types';

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

export const validationProcessingStatus = PROCESSING_STATUS_OPTIONS.map((item) => {
	if (item === 'complete') return { label: 'Válido', value: item };
	if (item === 'error') return { label: 'Erro', value: item };
	if (item === 'processing') return { label: 'Em Análise', value: item };
	if (item === 'waiting') return { label: 'Em Espera', value: item };
	return { label: 'Desconhecido', value: item };
});

/* * */

export interface ValidationNormalized extends GtfsValidation {
	agency_id_normalized: string
	agency_name_normalized: string
}
