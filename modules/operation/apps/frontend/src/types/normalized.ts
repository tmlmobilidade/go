/* * */

import { type GtfsValidation, type Vehicle } from '@tmlmobilidade/go-types-operation';
import { ProcessingStatusValues } from '@tmlmobilidade/go-types-shared';

/* * */

export const validationProcessingStatus = ProcessingStatusValues.map((item) => {
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

export interface VehicleNormalized extends Vehicle {
	agency_id_normalized: string
}
