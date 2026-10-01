/* * */

import { type LanguageTag } from '@tmlmobilidade/go-types-shared';

/**
 * Effect specific instructions to be included in the prompt for the generation of the alert descriptions.
 * This includes the correct nomenclature to be used for each effect, as well as any additional information
 * that may be relevant for the generation of the descriptions.
 */
export const activePeriodPrompt: Record<LanguageTag, (startDate: string, endDate: string) => string> = {

	en: (startDate: string, endDate: string) => `Active period: ${startDate} to ${endDate}`,

	es: (startDate: string, endDate: string) => `El alerta estará activo entre ${startDate} y ${endDate}`,

	pt: (startDate: string, endDate: string) => `O alerta estará ativo entre ${startDate} e ${endDate}`,

};
