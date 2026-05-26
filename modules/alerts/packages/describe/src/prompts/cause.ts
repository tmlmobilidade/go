/* * */

import { type AlertCause, type I18nCode } from '@tmlmobilidade/types';

const externalCauseClosingPrompt = 'No final da descrição, usa um fecho empático sem assumir culpa do operador, como "Agradecemos a sua compreensão." ou formulação equivalente.';

const internalCauseClosingPrompt = 'No final da descrição, podes usar um fecho empático com pedido de desculpa moderado, como "Lamentamos o incómodo e agradecemos a sua compreensão." ou formulação equivalente.';

const mixedCauseClosingPrompt = 'No final da descrição, ajusta o fecho à responsabilidade provável do operador: se a situação for externa, evita assumir culpa; se for interna ou planeada pelo operador, podes usar um pedido de desculpa moderado.';

/**
 * Cause specific instructions to be included in the prompt for the generation of the alert descriptions.
 * This includes the correct nomenclature to be used for each cause, as well as any additional information
 * that may be relevant for the generation of the descriptions.
 */
export const causePrompt: Record<AlertCause, Record<I18nCode, string>> = {
	ABUSIVE_PARKING: {
		en: '',
		pt: `Causa: Estacionamento Abusivo. ${externalCauseClosingPrompt}`,
	},
	ACCIDENT: {
		en: '',
		pt: `Causa: Acidente. ${externalCauseClosingPrompt}`,
	},
	CONSTRUCTION: {
		en: '',
		pt: `Causa: Obras ou Trabalhos na via (escolhe um). ${externalCauseClosingPrompt}`,
	},
	DEMONSTRATION: {
		en: '',
		pt: `Causa: Evento ou Manifestação (escolhe o mais adequado). Na descrição, explicita de forma clara que o condicionamento se deve a um evento ou manifestação; não substituas a causa por formulações vagas como "necessidade de desvio de percurso" ou "alterações na circulação". Se existir um período fixo e claramente delimitado no contexto, menciona esse intervalo horário na descrição. ${externalCauseClosingPrompt}`,
	},
	DRIVER_ABSENCE: {
		en: '',
		pt: `Causa: Questão Operacional. ${internalCauseClosingPrompt}`,
	},
	DRIVER_ISSUE: {
		en: '',
		pt: `Causa: Questão Operacional. ${internalCauseClosingPrompt}`,
	},
	HIGH_PASSENGER_LOAD: {
		en: '',
		pt: `Causa: Elevada Lotação ou Elevado Número de Passageiros (escolhe um). ${mixedCauseClosingPrompt}`,
	},
	MEDICAL_EMERGENCY: {
		en: '',
		pt: `Causa: Emergência Médica. ${externalCauseClosingPrompt}`,
	},
	NETWORK_UPDATE: {
		en: '',
		pt: `Causa: Atualização da Rede ou Atualização de Horários (escolhe um). ${internalCauseClosingPrompt}`,
	},
	POLICE_ACTIVITY: {
		en: '',
		pt: `Causa: Atividade Policial. ${externalCauseClosingPrompt}`,
	},
	PUBLIC_DISORDER: {
		en: '',
		pt: `Causa: Desacatos. ${externalCauseClosingPrompt}`,
	},
	ROAD_ISSUE: {
		en: '',
		pt: `Causa: Problema na Estrada. ${externalCauseClosingPrompt}`,
	},
	STRIKE: {
		en: '',
		pt: `Causa: Greve (é importante perceber se é uma greve deste operador ou de outro operador, e este operador está a ser afetado). ${mixedCauseClosingPrompt}`,
	},
	TECHNICAL_ISSUE: {
		en: '',
		pt: `Causa: Problema Técnico. ${internalCauseClosingPrompt}`,
	},
	TRAFFIC_JAM: {
		en: '',
		pt: `Causa: Trânsito ou Trânsito Intenso (escolhe um). ${externalCauseClosingPrompt}`,
	},
	VEHICLE_ISSUE: {
		en: '',
		pt: `Causa: Problema Técnico. ${internalCauseClosingPrompt}`,
	},
	WEATHER: {
		en: '',
		pt: `Causa: Condições Meteorológicas ou Mau Tempo (escolhe um). ${externalCauseClosingPrompt}`,
	},
};
