/* * */

import { type I18nCode } from '@tmlmobilidade/go-types-shared';

/**
 * Prompt for the generation of the alert descriptions for mixed causes,
 * where the operator may be at fault, to be used as a closing statement.
 */
export const mixedCauseClosingPrompt: Record<I18nCode, string> = {

	en: '',

	pt: 'No final da descrição, ajusta o fecho à responsabilidade provável do operador: se a situação for externa, evita assumir culpa; se for interna ou planeada pelo operador, podes usar um pedido de desculpa moderado.',

};
