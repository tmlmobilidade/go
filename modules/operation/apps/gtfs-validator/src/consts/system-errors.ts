/* * */

import { type GtfsValidationOutputResult } from '@tmlmobilidade/go-types-gtfs-validator';

/**
 * Predefined system error messages to be used
 * in GTFS validation results when unexpected errors occur,
 * like when the validation process fails due to an internal error
 * or when the maximum number of validation attempts is reached.
 */
export const SYSTEM_ERROR_MESSAGES = {

	GENERIC_ERROR: {
		description: 'Ocorreu um erro inesperado durante a validação. Tenta novamente ou entra em contacto connosco.',
		description_translation: { variant: 'default' },
		messages: [],
		rule_id: 'system_error_generic',
		severity: 'error',
		total_rows: 0,
	},

	MAX_ATTEMPTS_REACHED: {
		description: 'Número máximo de tentativas de validação atingido. Verifique o arquivo e tente novamente.',
		description_translation: { variant: 'default' },
		messages: [],
		rule_id: 'system_error_max_attempts_reached',
		severity: 'error',
		total_rows: 0,
	},

} satisfies Record<string, GtfsValidationOutputResult>;
