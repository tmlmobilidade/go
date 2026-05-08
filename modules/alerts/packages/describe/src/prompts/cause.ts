/* * */

import { type AlertCause, type I18nCode } from '@tmlmobilidade/types';

/**
 * Cause specific instructions to be included in the prompt for the generation of the alert descriptions.
 * This includes the correct nomenclature to be used for each cause, as well as any additional information
 * that may be relevant for the generation of the descriptions.
 */
export const causePrompt: Record<AlertCause, Record<I18nCode, string>> = {
	ABUSIVE_PARKING: {
		en: '',
		pt: 'Causa: Estacionamento Abusivo',
	},
	ACCIDENT: {
		en: '',
		pt: 'Causa: Acidente',
	},
	CONSTRUCTION: {
		en: '',
		pt: 'Causa: Obras ou Trabalhos na via (escolhe um)',
	},
	DEMONSTRATION: {
		en: '',
		pt: 'Causa: Evento (escolhe um)',
	},
	DRIVER_ABSENCE: {
		en: '',
		pt: 'Causa: Questão Operacional',
	},
	DRIVER_ISSUE: {
		en: '',
		pt: 'Causa: Questão Operacional',
	},
	HIGH_PASSENGER_LOAD: {
		en: '',
		pt: 'Causa: Elevada Lotação ou Elevado Número de Passageiros (escolhe um)',
	},
	MEDICAL_EMERGENCY: {
		en: '',
		pt: 'Causa: Emergência Médica',
	},
	NETWORK_UPDATE: {
		en: '',
		pt: 'Causa: Atualização da Rede ou Atualização de Horários (escolhe um)',
	},
	POLICE_ACTIVITY: {
		en: '',
		pt: 'Causa: Atividade Policial',
	},
	PUBLIC_DISORDER: {
		en: '',
		pt: 'Causa: Desacatos',
	},
	ROAD_ISSUE: {
		en: '',
		pt: 'Causa: Problema na Estrada',
	},
	STRIKE: {
		en: '',
		pt: 'Causa: Greve (é importante perceber se é uma greve deste operador ou de outro operador, e este operador está a ser afetado)',
	},
	TECHNICAL_ISSUE: {
		en: '',
		pt: 'Causa: Problema Técnico',
	},
	TRAFFIC_JAM: {
		en: '',
		pt: 'Causa: Trânsito ou Trânsito Intenso (escolhe um)',
	},
	VEHICLE_ISSUE: {
		en: '',
		pt: 'Causa: Problema Técnico',
	},
	WEATHER: {
		en: '',
		pt: 'Causa: Condições Meteorológicas ou Mau Tempo (escolhe um)',
	},
};
