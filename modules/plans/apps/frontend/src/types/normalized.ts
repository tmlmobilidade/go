/* * */

import { type PlanValidityStatus, PlanValidityStatusSchema } from '@tmlmobilidade/go-plans-pckg-types';
import { type GtfsValidation, type Plan } from '@tmlmobilidade/go-types-operation';
import { ProcessingStatusSchema } from '@tmlmobilidade/go-types-shared';
import { SelectDataItem } from '@tmlmobilidade/ui';

/* * */

export const planValidityStatusOptions: SelectDataItem[] = PlanValidityStatusSchema.options.map((value) => {
	if (value === 'active') return { label: 'Ativo', value };
	if (value === 'expired') return { label: 'Expirado', value };
	return { label: 'Agendado', value };
});

export const planValidityStatusValues = PlanValidityStatusSchema.options;

/* * */

export interface PlanNormalized extends Plan {
	agency_code_normalized: string
	agency_id_normalized: string
	agency_name_normalized: string
	validity_status: PlanValidityStatus
}

/* * */

export const validationProcessingStatus = ProcessingStatusSchema.options.map((item) => {
	if (item === 'complete') return { label: 'Válido', value: item };
	if (item === 'error') return { label: 'Erro', value: item };
	if (item === 'processing') return { label: 'Em Análise', value: item };
	if (item === 'waiting') return { label: 'Em Espera', value: item };
	return { label: 'Desconhecido', value: item };
});

/* * */

export interface ValidationNormalized extends GtfsValidation {
	agency_code_normalized: string
	agency_id_normalized: string
	agency_name_normalized: string
}
