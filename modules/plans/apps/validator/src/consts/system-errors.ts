/* * */

import { type GTFSValidatorMessage } from '@tmlmobilidade/types';

/**
 * Predefined system error messages to be used
 * in GTFS validation results when unexpected errors occur,
 * like when the validation process fails due to an internal error
 * or when the maximum number of validation attempts is reached.
 */
export const SYSTEM_ERROR_MESSAGES: Record<string, GTFSValidatorMessage> = {

	GENERIC_ERROR: {
		field: 'N/A',
		file_name: 'Erro de Sistema',
		message: 'Ocorreu um erro inesperado durante a validação. Tenta novamente ou entra em contacto connosco.',
		rows: [],
		severity: 'error',
		validation_id: 'system_error_generic',
	},

	MAX_ATTEMPTS_REACHED: {
		field: 'N/A',
		file_name: 'Erro de Sistema',
		message: 'Número máximo de tentativas de validação atingido. Verifique o arquivo e tente novamente.',
		rows: [],
		severity: 'error',
		validation_id: 'system_error_max_attempts_reached',
	},

};
