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
				pt: 'Um acidente/incidente está a provocar um desvio de percurso {in_def_f_p} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um acidente/incidente está a provocar um desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
			},
		},
	},

	'ACCIDENT:DETOUR:stops': undefined,

	'ACCIDENT:NO_SERVICE:lines': undefined,

	'ACCIDENT:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente/incidente, foi necessário cancelar {def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um acidente/incidente, foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'ACCIDENT:REDUCED_SERVICE:lines': undefined,

	'ACCIDENT:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um acidente/incidente obriga ao encurtamento {of_def_f_p} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um acidente/incidente obriga ao encurtamento {of_def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'ACCIDENT:SIGNIFICANT_DELAYS:agency': undefined,

	'ACCIDENT:SIGNIFICANT_DELAYS:lines': undefined,

	'ACCIDENT:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente/incidente, verificam-se atrasos significativos {in_def_f_p} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um acidente/incidente, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'CONSTRUCTION:ACCESSIBILITY_ISSUE:lines': undefined,

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

	'CONSTRUCTION:ACCESSIBILITY_ISSUE:stops': undefined,

	'CONSTRUCTION:DETOUR:lines': undefined,

	'CONSTRUCTION:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Trabalhos de construção estão a provocar um desvio de percurso {in_def_f_p} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Trabalhos de construção estão a provocar um desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
			},
		},
	},

	'CONSTRUCTION:DETOUR:stops': undefined,

	'CONSTRUCTION:NO_SERVICE:lines': undefined,

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
				pt: '{rides_title} | Viagens canceladas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem cancelada',
			},
		},
	},

	'CONSTRUCTION:NO_SERVICE:stops': undefined,

	'CONSTRUCTION:REDUCED_SERVICE:lines': undefined,

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

	'CONSTRUCTION:REDUCED_SERVICE:stops': undefined,

	'CONSTRUCTION:SIGNIFICANT_DELAYS:lines': undefined,

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

	'CONSTRUCTION:SIGNIFICANT_DELAYS:stops': undefined,

	'CONSTRUCTION:STOP_MOVED:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a obras, foi necessário deslocar temporariamente {def_f_p} {stops_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a obras, foi necessário deslocar temporariamente {def_f_s} {stops_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Paragem deslocada',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Paragem deslocada',
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

	'DEMONSTRATION:ADDITIONAL_SERVICE:agency': undefined,

	'DEMONSTRATION:ADDITIONAL_SERVICE:lines': undefined,

	'DEMONSTRATION:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um evento, foram adicionados novos horários {in_def_f_p} {rides_description_pt}. Consulte o site carrismetropolitana.pt para mais informações.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um evento, foram adicionados novos horários {in_def_f_s} {rides_description_pt}. Consulte o site carrismetropolitana.pt para mais informações.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Horários adicionais',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Horários adicionais',
			},
		},
	},

	'DEMONSTRATION:DETOUR:lines': undefined,

	'DEMONSTRATION:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'A realização de um evento está a provocar um desvio de percurso {in_def_f_p} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'A realização de um evento está a provocar um desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
			},
		},
	},

	'DEMONSTRATION:DETOUR:stops': undefined,

	'DEMONSTRATION:NO_SERVICE:lines': undefined,

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
				pt: '{rides_title} | Viagens canceladas',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Viagem cancelada',
			},
		},
	},

	'DEMONSTRATION:NO_SERVICE:stops': undefined,

	'DEMONSTRATION:REDUCED_SERVICE:lines': undefined,

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

	'DEMONSTRATION:REDUCED_SERVICE:stops': undefined,

	'DEMONSTRATION:SIGNIFICANT_DELAYS:agency': undefined,

	'DEMONSTRATION:SIGNIFICANT_DELAYS:lines': undefined,

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

	'DEMONSTRATION:SIGNIFICANT_DELAYS:stops': undefined,

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
				pt: 'Um imprevisto operacional obrigou à realização de um desvio de percurso {in_def_f_p} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um imprevisto operacional obrigou à realização de um desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
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
				pt: 'Uma vez que foi verificada alta ocupação, será realizado um desdobramento {of_def_f_p} {rides_description_pt}. Consulte o site carrismetropolitana.pt para mais informações.',
			},
			singular: {
				en: 'not-available',
				pt: 'Uma vez que foi verificada alta ocupação, será realizado um desdobramento {of_def_f_s} {rides_description_pt}. Consulte o site carrismetropolitana.pt para mais informações.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Horários adicionais',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Horários adicionais',
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
				pt: 'Devido a uma emergência médica foi necessário efetuar um desvio de percurso {in_def_f_p} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a uma emergência médica foi necessário efetuar um desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
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

	'POLICE_ACTIVITY:DETOUR:lines': undefined,

	'POLICE_ACTIVITY:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Atividade policial exige um desvio de percurso {in_def_f_p} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Atividade policial exige um desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
			},
		},
	},

	'POLICE_ACTIVITY:NO_SERVICE:lines': undefined,

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

	'POLICE_ACTIVITY:REDUCED_SERVICE:lines': undefined,

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

	'POLICE_ACTIVITY:SIGNIFICANT_DELAYS:agency': undefined,

	'POLICE_ACTIVITY:SIGNIFICANT_DELAYS:lines': undefined,

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
				pt: 'Desacatos provocam desvio de percurso {in_def_f_p} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Desacatos provocam desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
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

	'ROAD_ISSUE:ACCESSIBILITY_ISSUE:lines': undefined,

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

	'ROAD_ISSUE:ACCESSIBILITY_ISSUE:stops': undefined,

	'ROAD_ISSUE:DETOUR:lines': undefined,

	'ROAD_ISSUE:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Estacionamento abusivo obriga ao desvio de percurso {in_def_f_p} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Estacionamento abusivo obriga ao desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
			},
		},
	},

	'ROAD_ISSUE:DETOUR:stops': undefined,

	'ROAD_ISSUE:NO_SERVICE:lines': undefined,

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

	'ROAD_ISSUE:NO_SERVICE:stops': undefined,

	'ROAD_ISSUE:REDUCED_SERVICE:lines': undefined,

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

	'ROAD_ISSUE:REDUCED_SERVICE:stops': undefined,

	'ROAD_ISSUE:SIGNIFICANT_DELAYS:lines': undefined,

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

	'ROAD_ISSUE:SIGNIFICANT_DELAYS:stops': undefined,

	'STRIKE:ADDITIONAL_SERVICE:agency': undefined,

	'STRIKE:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido à realização de greve, será realizado um desdobramento {of_def_f_p} {rides_description_pt}. Consulte o site carrismetropolitana.pt para mais informações.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido à realização de greve, será realizado um desdobramento {of_def_f_s} {rides_description_pt}. Consulte o site carrismetropolitana.pt para mais informações.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Horários adicionais',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Horários adicionais',
			},
		},
	},

	'STRIKE:ADDITIONAL_SERVICE:stops': undefined,

	'STRIKE:DETOUR:lines': undefined,

	'STRIKE:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Por motivos de greve é necessário efetuar um desvio de percurso {in_def_f_p} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Por motivos de greve é necessário efetuar um desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
			},
		},
	},

	'STRIKE:DETOUR:stops': undefined,

	'STRIKE:NO_SERVICE:agency': undefined,

	'STRIKE:NO_SERVICE:lines': undefined,

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

	'STRIKE:REDUCED_SERVICE:lines': undefined,

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

	'STRIKE:SIGNIFICANT_DELAYS:agency': undefined,

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
				pt: 'Um problema técnico está a impedir o funcionamento normal dos sistemas de venda a bordo {in_def_f_p} {rides_description_pt}. Lamentamos o incómodo causado enquanto restabelecemos o funcionamento normal.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um problema técnico está a impedir o funcionamento normal dos sistemas de venda a bordo {in_def_f_s} {rides_description_pt}. Lamentamos o incómodo causado enquanto restabelecemos o funcionamento normal.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Venda a bordo indisponível',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Venda a bordo indisponível',
			},
		},
	},

	'TECHNICAL_ISSUE:REALTIME_INFO_ISSUE:agency': undefined,

	'TECHNICAL_ISSUE:REALTIME_INFO_ISSUE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um problema técnico está a impedir o funcionamento normal dos sistemas de localização em tempo real {in_def_f_p} {rides_description_pt}. Lamentamos o incómodo causado enquanto restabelecemos o funcionamento normal.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um problema técnico está a impedir o funcionamento normal dos sistemas de localização em tempo real {in_def_f_s} {rides_description_pt}. Lamentamos o incómodo causado enquanto restabelecemos o funcionamento normal.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Tempo real indisponível',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Tempo real indisponível',
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

	'TECHNICAL_ISSUE:SIGNIFICANT_DELAYS:agency': undefined,

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

	'TRAFFIC_JAM:DETOUR:lines': undefined,

	'TRAFFIC_JAM:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Elevado volume de trânsito inesperado exige um desvio de percurso {in_def_f_p} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Elevado volume de trânsito inesperado exige um desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
			},
		},
	},

	'TRAFFIC_JAM:DETOUR:stops': undefined,

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

	'TRAFFIC_JAM:SIGNIFICANT_DELAYS:agency': undefined,

	'TRAFFIC_JAM:SIGNIFICANT_DELAYS:lines': undefined,

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

	'TRAFFIC_JAM:SIGNIFICANT_DELAYS:stops': undefined,

	'WEATHER:ACCESSIBILITY_ISSUE:lines': undefined,

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

	'WEATHER:ACCESSIBILITY_ISSUE:stops': undefined,

	'WEATHER:DETOUR:lines': undefined,

	'WEATHER:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Condições metereológicas adversas exigem um desvio de percurso {in_def_f_p} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Condições metereológicas adversas exigem um desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{rides_title} | Desvio de Percurso',
			},
		},
	},

	'WEATHER:DETOUR:stops': undefined,

	'WEATHER:NO_SERVICE:lines': undefined,

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

	'WEATHER:NO_SERVICE:stops': undefined,

	'WEATHER:REDUCED_SERVICE:lines': undefined,

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

	'WEATHER:REDUCED_SERVICE:stops': undefined,

	'WEATHER:SIGNIFICANT_DELAYS:agency': undefined,

	'WEATHER:SIGNIFICANT_DELAYS:lines': undefined,

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

	'WEATHER:SIGNIFICANT_DELAYS:stops': undefined,

};
