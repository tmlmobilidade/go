/* * */

import { type I18nCode } from '@tmlmobilidade/go-types-shared';

/**
 * Effect specific instructions to be included in the prompt for the generation of the alert descriptions.
 * This includes the correct nomenclature to be used for each effect, as well as any additional information
 * that may be relevant for the generation of the descriptions.
 */
export const activePeriodPrompt: Record<I18nCode, (startDate: string, endDate: string) => string> = {

	en: (startDate: string, endDate: string) => `Active period: ${startDate} to ${endDate}`,

	pt: (startDate: string, endDate: string) => `O alerta estará ativo entre ${startDate} e ${endDate}`,

};
