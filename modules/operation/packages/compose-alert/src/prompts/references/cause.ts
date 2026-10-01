/* * */

import { type AlertCause } from '@tmlmobilidade/go-types-operation';
import { type LanguageTag } from '@tmlmobilidade/go-types-shared';

/**
 * Prompt for the generation of the alert descriptions for each cause,
 * including the correct nomenclature to be used for each cause,
 * as well as any additional information that may be relevant for the generation of the descriptions.
 */
export const causePrompt: Record<AlertCause, Record<LanguageTag, string>> = {

	ABUSIVE_PARKING: {
		en: '',
		es: '',
		pt: `Causa: Estacionamento Abusivo.`,
	},

	ACCIDENT: {
		en: '',
		es: '',
		pt: `Causa: Acidente.`,
	},

	CONSTRUCTION: {
		en: '',
		es: '',
		pt: `Causa: Obras ou Trabalhos na via (escolhe um).`,
	},

	DEMONSTRATION: {
		en: '',
		es: '',
		pt: `Causa: Evento ou Manifestação (escolhe o mais adequado).`,
	},

	DRIVER_ABSENCE: {
		en: '',
		es: '',
		pt: `Causa: Imprevisto Operacional.`,
	},

	DRIVER_ISSUE: {
		en: '',
		es: '',
		pt: `Causa: Imprevisto Operacional.`,
	},

	HIGH_PASSENGER_LOAD: {
		en: '',
		es: '',
		pt: `Causa: Elevada Lotação ou Elevado Número de Passageiros (escolhe um).`,
	},

	MEDICAL_EMERGENCY: {
		en: '',
		es: '',
		pt: `Causa: Emergência Médica.`,
	},

	NETWORK_UPDATE: {
		en: '',
		es: '',
		pt: `Causa: Atualização da Rede ou Atualização de Horários (escolhe um).`,
	},

	POLICE_ACTIVITY: {
		en: '',
		es: '',
		pt: `Causa: Atividade Policial.`,
	},

	PUBLIC_DISORDER: {
		en: '',
		es: '',
		pt: `Causa: Desacatos.`,
	},

	ROAD_ISSUE: {
		en: '',
		es: '',
		pt: `Causa: Problema na Estrada.`,
	},

	STRIKE: {
		en: '',
		es: '',
		pt: `Causa: Greve (é importante perceber se é uma greve deste operador ou de outro operador, e fazer essa distinção no texto gerado).`,
	},

	TECHNICAL_ISSUE: {
		en: '',
		es: '',
		pt: `Causa: Problema Técnico.`,
	},

	TRAFFIC_JAM: {
		en: '',
		es: '',
		pt: `Causa: Trânsito ou Trânsito Intenso (escolhe um).`,
	},

	VEHICLE_ISSUE: {
		en: '',
		es: '',
		pt: `Causa: Problema Técnico.`,
	},

	WEATHER: {
		en: '',
		es: '',
		pt: `Causa: Condições Meteorológicas ou Mau Tempo (escolhe um).`,
	},

} as const;
