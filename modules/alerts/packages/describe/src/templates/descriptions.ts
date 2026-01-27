/* * */

import { type TemplateFragment } from '@/types/types.js';
import { type AlertCauseEffectReference } from '@tmlmobilidade/types';

/**
 * Alert i18n templates registry.
 * Each key is formed by the combination of cause, effect and reference_type
 * of an alert in the format: 'CAUSE:EFFECT:REFERENCE_TYPE'
 */
export const alertI18nTemplates: Record<AlertCauseEffectReference, TemplateFragment> = {

	'ACCIDENT:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um acidente está a provocar um desvio de percurso {in_def_f_p} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um acidente está a provocar um desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso devido a Acidente',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso devido a Acidente',
			},
		},
	},

	'ACCIDENT:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente, foi necessário cancelar {def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um acidente, foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens canceladas devido a Acidente',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem cancelada devido a Acidente',
			},
		},
	},

	'ACCIDENT:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um acidente obriga ao encurtamento {of_def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um acidente obriga ao encurtamento {of_def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens encurtadas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem encurtada',
			},
		},
	},

	'ACCIDENT:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente, verificam-se atrasos significativos {in_def_f_p} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um acidente, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
		},
	},

	'CONSTRUCTION:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a obras, a acessibilidade para passageiros PMR está comprometida {in_def_f_p} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a obras, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Acessibilidade comprometida',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Acessibilidade comprometida',
			},
		},
	},

	'CONSTRUCTION:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
	},

	'CONSTRUCTION:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Por motivo de obras, foi necessário cancelar {def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Por motivo de obras, foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens canceladas devido a Obras',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem cancelada devido a Obras',
			},
		},
	},

	'CONSTRUCTION:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Trabalhos de construção obrigam ao encurtamento {of_def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Trabalhos de construção obrigam ao encurtamento {of_def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens encurtadas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem encurtada',
			},
		},
	},

	'CONSTRUCTION:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a obras, verificam-se atrasos significativos {in_def_f_p} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a obras, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
		},
	},

	'CONSTRUCTION:STOP_MOVED:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
	},

	'DEMONSTRATION:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um evento, a acessibilidade para passageiros PMR está comprometida {in_def_f_p} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um evento, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Acessibilidade comprometida',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Acessibilidade comprometida',
			},
		},
	},

	'DEMONSTRATION:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
	},

	'DEMONSTRATION:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
	},

	'DEMONSTRATION:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido à realização de um evento foi necessário cancelar {def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido à realização de um evento foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens canceladas devido a Evento',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem cancelada devido a Evento',
			},
		},
	},

	'DEMONSTRATION:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um evento exige o encurtamento {of_def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um evento exige o encurtamento {of_def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens encurtadas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem encurtada',
			},
		},
	},

	'DEMONSTRATION:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um evento, verificam-se atrasos significativos {in_def_f_p} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um evento, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
		},
	},

	'DRIVER_ABSENCE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um imprevisto operacional foi necessário cancelar {def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um imprevisto operacional foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens canceladas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem cancelada',
			},
		},
	},

	'DRIVER_ABSENCE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um problema operacional, verificam-se atrasos significativos {in_def_f_p} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um problema operacional, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
		},
	},

	'DRIVER_ISSUE:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
	},

	'DRIVER_ISSUE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um imprevisto operacional foi necessário cancelar {def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um imprevisto operacional foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens canceladas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem cancelada',
			},
		},
	},

	'DRIVER_ISSUE:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um imprevisto operacional exige o encurtamento {of_def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um imprevisto operacional exige o encurtamento {of_def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens encurtadas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem encurtada',
			},
		},
	},

	'DRIVER_ISSUE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um problema operacional, verificam-se atrasos significativos {in_def_f_p} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um problema operacional, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
		},
	},

	'HIGH_PASSENGER_LOAD:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido ao elevado volume de passageiros, a acessibilidade para passageiros PMR está comprometida {in_def_f_p} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido ao elevado volume de passageiros, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Acessibilidade comprometida',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Acessibilidade comprometida',
			},
		},
	},

	'HIGH_PASSENGER_LOAD:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
	},

	'HIGH_PASSENGER_LOAD:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido ao elevado volume de passageiros, verificam-se atrasos significativos {in_def_f_p} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido ao elevado volume de passageiros, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
		},
	},

	'MEDICAL_EMERGENCY:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
	},

	'MEDICAL_EMERGENCY:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a uma emergência médica foi necessário cancelar {def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a uma emergência médica foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens canceladas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem cancelada',
			},
		},
	},

	'MEDICAL_EMERGENCY:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Uma emergência médica exige o encurtamento {of_def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Uma emergência médica exige o encurtamento {of_def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens encurtadas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem encurtada',
			},
		},
	},

	'MEDICAL_EMERGENCY:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a uma emergência médica, verificam-se atrasos significativos {in_def_f_p} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a uma emergência médica, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
		},
	},

	'POLICE_ACTIVITY:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
	},

	'POLICE_ACTIVITY:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a atividade policial foi necessário cancelar {def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a atividade policial foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens canceladas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem cancelada',
			},
		},
	},

	'POLICE_ACTIVITY:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Atividade policial exige o encurtamento {of_def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Atividade policial exige o encurtamento {of_def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens encurtadas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem encurtada',
			},
		},
	},

	'POLICE_ACTIVITY:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a atividade policial, verificam-se atrasos significativos {in_def_f_p} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a atividade policial, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
		},
	},

	'PUBLIC_DISORDER:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
	},

	'PUBLIC_DISORDER:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um desacato foi necessário cancelar {def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um desacato foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens canceladas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem cancelada',
			},
		},
	},

	'PUBLIC_DISORDER:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Desacato provoca o encurtamento {of_def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Desacato provoca o encurtamento {of_def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens encurtadas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem encurtada',
			},
		},
	},

	'PUBLIC_DISORDER:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um desacato no veículo, verificam-se atrasos significativos {in_def_f_p} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um desacato no veículo, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
		},
	},

	'ROAD_ISSUE:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a estacionamento abusivo, a acessibilidade para passageiros PMR está comprometida {in_def_f_p} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a estacionamento abusivo, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Acessibilidade comprometida',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Acessibilidade comprometida',
			},
		},
	},

	'ROAD_ISSUE:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
	},

	'ROAD_ISSUE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a estacionamento abusivo foi necessário cancelar {def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a estacionamento abusivo foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens canceladas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem cancelada',
			},
		},
	},

	'ROAD_ISSUE:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Estacionamento abusivo impede a passagem e por isso é necessário encurtar {def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Estacionamento abusivo impede a passagem e por isso é necessário encurtar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens encurtadas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem encurtada',
			},
		},
	},

	'ROAD_ISSUE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a estacionamento abusivo, verificam-se atrasos significativos {in_def_f_p} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a estacionamento abusivo, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
		},
	},

	'STRIKE:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
	},

	'STRIKE:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
	},

	'STRIKE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Por motivos de greve foi necessário cancelar {def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Por motivos de greve foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens canceladas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem cancelada',
			},
		},
	},

	'STRIKE:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Por motivo de greve é necessário encurtar {def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Por motivo de greve é necessário encurtar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens encurtadas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem encurtada',
			},
		},
	},

	'STRIKE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Por motivos de greve, verificam-se atrasos significativos {in_def_f_p} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Por motivos de greve, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
		},
	},

	'TECHNICAL_ISSUE:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um problema técnico, a acessibilidade para passageiros PMR está comprometida {in_def_f_p} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um problema técnico, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Acessibilidade comprometida',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Acessibilidade comprometida',
			},
		},
	},

	'TECHNICAL_ISSUE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um problema técnico obrigou ao cancelamento {def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um problema técnico obrigou ao cancelamento {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens canceladas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem cancelada',
			},
		},
	},

	'TECHNICAL_ISSUE:ON_BOARD_SALE_ISSUE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
	},

	'TECHNICAL_ISSUE:REALTIME_INFO_ISSUE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
	},

	'TECHNICAL_ISSUE:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um problema técnico obriga a encurtar {def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um problema técnico obriga a encurtar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens encurtadas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem encurtada',
			},
		},
	},

	'TECHNICAL_ISSUE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido ao elevado volume de passageiros, verificam-se atrasos significativos {in_def_f_p} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido ao elevado volume de passageiros, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
		},
	},

	'TRAFFIC_JAM:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
	},

	'TRAFFIC_JAM:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a atrasos excessivos provocados por elevado volume de trânsito inesperado, foi necessário cancelar {def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a atrasos excessivos provocados por elevado volume de trânsito inesperado, foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens canceladas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem cancelada',
			},
		},
	},

	'TRAFFIC_JAM:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Trânsito excessivo exige encurtar {def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Trânsito excessivo exige encurtar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens encurtadas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem encurtada',
			},
		},
	},

	'TRAFFIC_JAM:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido ao elevado volume de passageiros, verificam-se atrasos significativos {in_def_f_p} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido ao elevado volume de passageiros, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
		},
	},

	'WEATHER:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas, a acessibilidade para passageiros PMR está comprometida {in_def_f_p} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Acessibilidade comprometida',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Acessibilidade comprometida',
			},
		},
	},

	'WEATHER:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
			singular: {
				en: 'not-available',
				pt: 'Texto indisponível',
			},
		},
	},

	'WEATHER:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'As condições metereológicas adversas obrigaram ao cancelamento {def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'As condições metereológicas adversas obrigaram ao cancelamento {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens canceladas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem cancelada',
			},
		},
	},

	'WEATHER:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas verificadas é necessário encurtar {def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas verificadas é necessário encurtar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Viagens encurtadas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem encurtada',
			},
		},
	},

	'WEATHER:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido ao elevado volume de passageiros, verificam-se atrasos significativos {in_def_f_p} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido ao elevado volume de passageiros, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Atrasos significativos',
			},
		},
	},

};
