/* * */

import { type GtfsValidationOutputMessage } from '@tmlmobilidade/go-types-gtfs-validator';

/**
 * Predefined system error messages to be used
 * in GTFS validation results when unexpected errors occur,
 * like when the validation process fails due to an internal error.
 */
export const SYSTEM_ERROR_MESSAGES: Record<string, GtfsValidationOutputMessage> = {

	GENERIC_ERROR: {
		field: 'N/A',
		file_name: 'Erro de Sistema',
		message: 'Ocorreu um erro inesperado durante a validação. Tenta novamente ou entra em contacto connosco.',
		rows: [],
		rule_id: 'system_error_generic',
		severity: 'error',
	},
};
