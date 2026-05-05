/* * */

import { type AlertEffect, type I18nCode } from '@tmlmobilidade/types';

/**
 * Effect specific instructions to be included in the prompt for the generation of the alert descriptions.
 * This includes the correct nomenclature to be used for each effect, as well as any additional information
 * that may be relevant for the generation of the descriptions.
 */
export const effectPrompt: Record<AlertEffect, Record<I18nCode, string>> = {
	ACCESSIBILITY_ISSUE: {
		en: '',
		pt: 'Efeito: Problema de Acessibilidade para Pessoas com Mobilidade Reduzida',
	},
	ADDITIONAL_SERVICE: {
		en: '',
		pt: 'Efeito: Aumento de Serviço ou Novos Horários (escolhe um)',
	},
	DETOUR: {
		en: '',
		pt: 'Efeito: Desvio de Percurso',
	},
	MODIFIED_SERVICE: {
		en: '',
		pt: 'Efeito: Serviço Modificado',
	},
	NO_SERVICE: {
		en: '',
		pt: 'Efeito: Serviço Interrompido ou Cancelamento de Serviço (escolhe um)',
	},
	ON_BOARD_SALE_ISSUE: {
		en: '',
		pt: 'Efeito: Impedimento dos sistemas de venda a bordo',
	},
	REALTIME_INFO_ISSUE: {
		en: '',
		pt: 'Efeito: Problema com a informação em tempo real',
	},
	REDUCED_SERVICE: {
		en: '',
		pt: 'Efeito: Encurtamento de Percurso',
	},
	SIGNIFICANT_DELAYS: {
		en: '',
		pt: 'Efeito: Atrasos Significativos ou apenas Atrasos (escolhe um)',
	},
	STOP_MOVED: {
		en: '',
		pt: 'Efeito: Paragem Deslocada ou Alteração de Local de Paragem (escolhe um)',
	},
};
