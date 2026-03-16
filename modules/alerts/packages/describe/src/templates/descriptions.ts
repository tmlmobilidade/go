/* * */

import { type TemplateFragment } from '@/types/types.js';
import { type AlertCauseEffectReference } from '@tmlmobilidade/types';

/**
 * Alert i18n templates registry.
 * Each key is formed by the combination of cause, effect and reference_type
 * of an alert in the format: 'CAUSE:EFFECT:REFERENCE_TYPE'
 */
export const alertI18nTemplates: Record<AlertCauseEffectReference, TemplateFragment> = {
	'ABUSIVE_PARKING:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a estacionamento abusivo, a acessibilidade para passageiros PMR está comprometida {in_def_f_p} {lines_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a estacionamento abusivo, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {lines_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Acessibilidade comprometida',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Acessibilidade comprometida',
			},
		},
	},

	'ABUSIVE_PARKING:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a estacionamento abusivo, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'ABUSIVE_PARKING:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a estacionamento abusivo, a acessibilidade para passageiros PMR está comprometida {in_def_f_p} {stops_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a estacionamento abusivo, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {stops_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Acessibilidade comprometida',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Acessibilidade comprometida',
			},
		},
	},

	'ABUSIVE_PARKING:DETOUR:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Estacionamento abusivo obriga ao desvio de percurso {in_def_f_p} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Estacionamento abusivo obriga ao desvio de percurso {in_def_f_s} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
		},
	},

	'ABUSIVE_PARKING:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Estacionamento abusivo obriga ao desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
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

	'ABUSIVE_PARKING:DETOUR:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Estacionamento abusivo obriga ao desvio de percurso que afeta {def_f_p} {stops_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Estacionamento abusivo obriga ao desvio de percurso que afeta {def_f_s} {stops_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Desvio de Percurso',
			},
		},
	},

	'ABUSIVE_PARKING:NO_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a estacionamento abusivo foi necessário cancelar o serviço {in_def_f_p} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a estacionamento abusivo foi necessário cancelar o serviço {in_def_f_s} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Serviço cancelado',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Serviço cancelado',
			},
		},
	},

	'ABUSIVE_PARKING:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a estacionamento abusivo foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'ABUSIVE_PARKING:NO_SERVICE:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a estacionamento abusivo, {def_f_p} {stops_description_pt} não serão servidas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a estacionamento abusivo, {def_f_s} {stops_description_pt} não será servida. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Paragens não servidas',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Paragem não servida',
			},
		},
	},

	'ABUSIVE_PARKING:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Estacionamento abusivo impede a passagem e por isso é necessário reduzir o serviço {in_def_f_p} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Estacionamento abusivo impede a passagem e por isso é necessário reduzir o serviço {in_def_f_s} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Serviço reduzido',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Serviço reduzido',
			},
		},
	},

	'ABUSIVE_PARKING:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Estacionamento abusivo impede a passagem e por isso é necessário encurtar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'ABUSIVE_PARKING:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Estacionamento abusivo impede a passagem e por isso é necessário reduzir o serviço {in_def_f_p} {stops_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Estacionamento abusivo impede a passagem e por isso é necessário reduzir o serviço {in_def_f_s} {stops_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Serviço reduzido',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Serviço reduzido',
			},
		},
	},

	'ABUSIVE_PARKING:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a estacionamento abusivo, verificam-se atrasos significativos {in_def_f_p} {lines_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a estacionamento abusivo, verificam-se atrasos significativos {in_def_f_s} {lines_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Atrasos significativos',
			},
		},
	},

	'ABUSIVE_PARKING:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a estacionamento abusivo, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'ABUSIVE_PARKING:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a estacionamento abusivo, verificam-se atrasos significativos {in_def_f_p} {stops_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a estacionamento abusivo, verificam-se atrasos significativos {in_def_f_s} {stops_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Atrasos significativos',
			},
		},
	},

	'ACCIDENT:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um acidente/incidente está a provocar um desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
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

	'ACCIDENT:DETOUR:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um acidente/incidente está a provocar um desvio de percurso que afeta {def_f_p} {stops_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um acidente/incidente está a provocar um desvio de percurso que afeta {def_f_s} {stops_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Desvio de Percurso',
			},
		},
	},

	'ACCIDENT:NO_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente, foi necessário cancelar o serviço {in_def_f_p} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um acidente, foi necessário cancelar o serviço {in_def_f_s} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Serviço cancelado',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Serviço cancelado',
			},
		},
	},

	'ACCIDENT:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente/incidente, foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'ACCIDENT:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um acidente/incidente obriga à redução do serviço {in_def_f_p} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um acidente/incidente obriga à redução do serviço {in_def_f_s} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Serviço reduzido',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Serviço reduzido',
			},
		},
	},

	'ACCIDENT:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um acidente/incidente obriga ao encurtamento {of_def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'ACCIDENT:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente, verificam-se atrasos significativos {in_def_f_s} {agency_title}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um acidente, verificam-se atrasos significativos {in_def_f_s} {agency_title}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{agency_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{agency_title} | Atrasos significativos',
			},
		},
	},

	'ACCIDENT:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente, verificam-se atrasos significativos {in_def_f_p} {lines_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um acidente, verificam-se atrasos significativos {in_def_f_s} {lines_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Atrasos significativos',
			},
		},
	},

	'ACCIDENT:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente/incidente, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'ACCIDENT:STOP_MOVED:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente/incidente, foi necessário deslocar temporariamente {def_f_p} {stops_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um acidente/incidente, foi necessário deslocar temporariamente {def_f_s} {stops_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'CONSTRUCTION:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a obras, a acessibilidade para passageiros PMR está comprometida {in_def_f_p} {lines_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a obras, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {lines_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Acessibilidade comprometida',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Acessibilidade comprometida',
			},
		},
	},

	'CONSTRUCTION:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a obras, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'CONSTRUCTION:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a obras, a acessibilidade para passageiros PMR está comprometida {in_def_f_p} {stops_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a obras, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {stops_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Acessibilidade comprometida',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Acessibilidade comprometida',
			},
		},
	},

	'CONSTRUCTION:DETOUR:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Trabalhos de construção estão a provocar um desvio de percurso {in_def_f_p} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Trabalhos de construção estão a provocar um desvio de percurso {in_def_f_s} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
		},
	},

	'CONSTRUCTION:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Trabalhos de construção estão a provocar um desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
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

	'CONSTRUCTION:DETOUR:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Trabalhos de construção estão a provocar um desvio de percurso que afeta {def_f_p} {stops_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Trabalhos de construção estão a provocar um desvio de percurso que afeta {def_f_s} {stops_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Desvio de Percurso',
			},
		},
	},

	'CONSTRUCTION:NO_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Por motivo de obras, foi necessário cancelar o serviço {in_def_f_p} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Por motivo de obras, foi necessário cancelar o serviço {in_def_f_s} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Serviço cancelado',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Serviço cancelado',
			},
		},
	},

	'CONSTRUCTION:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Por motivo de obras, foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'CONSTRUCTION:NO_SERVICE:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Por motivo de obras, {def_f_p} {stops_description_pt} não serão servidas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Por motivo de obras, {def_f_s} {stops_description_pt} não será servida. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Paragens não servidas',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Paragem não servida',
			},
		},
	},

	'CONSTRUCTION:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Trabalhos de construção obrigam à redução do serviço {in_def_f_p} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Trabalhos de construção obrigam à redução do serviço {in_def_f_s} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Serviço reduzido',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Serviço reduzido',
			},
		},
	},

	'CONSTRUCTION:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Trabalhos de construção obrigam ao encurtamento {of_def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'CONSTRUCTION:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Trabalhos de construção obrigam à redução do serviço {in_def_f_p} {stops_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Trabalhos de construção obrigam à redução do serviço {in_def_f_s} {stops_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Serviço reduzido',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Serviço reduzido',
			},
		},
	},

	'CONSTRUCTION:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a obras, verificam-se atrasos significativos {in_def_f_p} {lines_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a obras, verificam-se atrasos significativos {in_def_f_s} {lines_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Atrasos significativos',
			},
		},
	},

	'CONSTRUCTION:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a obras, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'CONSTRUCTION:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a obras, verificam-se atrasos significativos {in_def_f_p} {stops_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a obras, verificam-se atrasos significativos {in_def_f_s} {stops_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Atrasos significativos',
			},
		},
	},

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
				pt: 'Devido a um evento, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'DEMONSTRATION:ADDITIONAL_SERVICE:agency': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um evento, foram adicionados novos horários {in_def_f_s} {agency_title}. Consulte o site carrismetropolitana.pt para mais informações.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um evento, foram adicionados novos horários {in_def_f_s} {agency_title}. Consulte o site carrismetropolitana.pt para mais informações.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{agency_title} | Horários adicionais',
			},
			singular: {
				en: 'not-available',
				pt: '{agency_title} | Horários adicionais',
			},
		},
	},

	'DEMONSTRATION:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um evento, foram adicionados novos horários {in_def_f_p} {lines_description_pt}. Consulte o site carrismetropolitana.pt para mais informações.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um evento, foram adicionados novos horários {in_def_f_s} {lines_description_pt}. Consulte o site carrismetropolitana.pt para mais informações.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Horários adicionais',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Horários adicionais',
			},
		},
	},

	'DEMONSTRATION:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um evento, foram adicionados novos horários {in_def_f_s} {rides_description_pt}. Consulte o site carrismetropolitana.pt para mais informações.',
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

	'DEMONSTRATION:DETOUR:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'A realização de um evento está a provocar um desvio de percurso {in_def_f_p} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'A realização de um evento está a provocar um desvio de percurso {in_def_f_s} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
		},
	},

	'DEMONSTRATION:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'A realização de um evento está a provocar um desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
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

	'DEMONSTRATION:DETOUR:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'A realização de um evento está a provocar um desvio de percurso que afeta {def_f_p} {stops_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'A realização de um evento está a provocar um desvio de percurso que afeta {def_f_s} {stops_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Desvio de Percurso',
			},
		},
	},

	'DEMONSTRATION:NO_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido à realização de um evento foi necessário cancelar o serviço {in_def_f_p} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido à realização de um evento foi necessário cancelar o serviço {in_def_f_s} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Serviço cancelado',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Serviço cancelado',
			},
		},
	},

	'DEMONSTRATION:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido à realização de um evento foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'DEMONSTRATION:NO_SERVICE:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido à realização de um evento, {def_f_p} {stops_description_pt} não serão servidas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido à realização de um evento, {def_f_s} {stops_description_pt} não será servida. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Paragens não servidas',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Paragem não servida',
			},
		},
	},

	'DEMONSTRATION:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um evento exige a redução do serviço {in_def_f_p} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um evento exige a redução do serviço {in_def_f_s} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Serviço reduzido',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Serviço reduzido',
			},
		},
	},

	'DEMONSTRATION:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um evento exige o encurtamento {of_def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'DEMONSTRATION:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um evento exige a redução do serviço {in_def_f_p} {stops_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um evento exige a redução do serviço {in_def_f_s} {stops_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Serviço reduzido',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Serviço reduzido',
			},
		},
	},

	'DEMONSTRATION:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um evento, verificam-se atrasos significativos {in_def_f_s} {agency_title}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um evento, verificam-se atrasos significativos {in_def_f_s} {agency_title}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{agency_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{agency_title} | Atrasos significativos',
			},
		},
	},

	'DEMONSTRATION:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um evento, verificam-se atrasos significativos {in_def_f_p} {lines_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um evento, verificam-se atrasos significativos {in_def_f_s} {lines_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Atrasos significativos',
			},
		},
	},

	'DEMONSTRATION:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um evento, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'DEMONSTRATION:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um evento, verificam-se atrasos significativos {in_def_f_p} {stops_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um evento, verificam-se atrasos significativos {in_def_f_s} {stops_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Atrasos significativos',
			},
		},
	},

	'DEMONSTRATION:STOP_MOVED:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um evento, a acessibilidade para passageiros PMR está comprometida {in_def_f_p} {stops_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um evento, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {stops_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Acessibilidade comprometida',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Acessibilidade comprometida',
			},
		},
	},

	'DRIVER_ABSENCE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um imprevisto operacional foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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
				pt: 'Devido a um problema operacional, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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
				pt: 'Um imprevisto operacional obrigou à realização de um desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
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
				pt: 'Devido a um imprevisto operacional foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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
				pt: 'Um imprevisto operacional exige o encurtamento {of_def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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
				pt: 'Devido a um problema operacional, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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
				pt: 'Devido ao elevado volume de passageiros, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
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
				pt: 'Uma vez que foi verificada alta ocupação, será realizado um desdobramento {of_def_f_s} {rides_description_pt}. Consulte o site carrismetropolitana.pt para mais informações.',
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
				pt: 'Devido ao elevado volume de passageiros, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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
				pt: 'Devido a uma emergência médica foi necessário efetuar um desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
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
				pt: 'Devido a uma emergência médica foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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
				pt: 'Uma emergência médica exige o encurtamento {of_def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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
				pt: 'Devido a uma emergência médica, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'NETWORK_UPDATE:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Atualização da rede exige um serviço adicional {in_def_f_p} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Atualização da rede exige um serviço adicional {in_def_f_s} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Serviço Adicional',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Serviço Adicional',
			},
		},
	},

	'NETWORK_UPDATE:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a uma atualização na rede, está disponível um serviço adicional {in_def_f_p} {stops_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a uma atualização na rede, está disponível um serviço adicional {in_def_f_s} {stops_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Serviço Adicional',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Serviço Adicional',
			},
		},
	},

	'NETWORK_UPDATE:DETOUR:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Atualização da rede exige um desvio de percurso {in_def_f_p} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Atualização da rede exige um desvio de percurso {in_def_f_s} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
		},
	},

	'NETWORK_UPDATE:DETOUR:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a uma atualização na rede, está disponível um serviço adicional {in_def_f_p} {stops_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a uma atualização na rede, está disponível um serviço adicional {in_def_f_s} {stops_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Serviço Adicional',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Serviço Adicional',
			},
		},
	},

	'NETWORK_UPDATE:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Atualização da rede exige um serviço modificado {in_def_f_p} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Atualização da rede exige um serviço modificado {in_def_f_s} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
		},
	},

	'NETWORK_UPDATE:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, a acessibilidade para passageiros PMR está comprometida {in_def_f_p} {stops_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {stops_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Acessibilidade comprometida',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Acessibilidade comprometida',
			},
		},
	},

	'NETWORK_UPDATE:NO_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Atualização da rede exige um serviço cancelado {in_def_f_p} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Atualização da rede exige um serviço cancelado {in_def_f_s} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
		},
	},

	'NETWORK_UPDATE:NO_SERVICE:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, a acessibilidade para passageiros PMR está comprometida {in_def_f_p} {stops_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {stops_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Acessibilidade comprometida',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Acessibilidade comprometida',
			},
		},
	},

	'NETWORK_UPDATE:STOP_MOVED:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, a acessibilidade para passageiros PMR está comprometida {in_def_f_p} {stops_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {stops_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Acessibilidade comprometida',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Acessibilidade comprometida',
			},
		},
	},

	'POLICE_ACTIVITY:DETOUR:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Atividade policial exige um desvio de percurso {in_def_f_p} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Atividade policial exige um desvio de percurso {in_def_f_s} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
		},
	},

	'POLICE_ACTIVITY:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Atividade policial exige um desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
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

	'POLICE_ACTIVITY:NO_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a atividade policial foi necessário cancelar o serviço {in_def_f_p} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a atividade policial foi necessário cancelar o serviço {in_def_f_s} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Serviço cancelado',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Serviço cancelado',
			},
		},
	},

	'POLICE_ACTIVITY:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a atividade policial foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'POLICE_ACTIVITY:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Atividade policial exige a redução do serviço {in_def_f_p} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Atividade policial exige a redução do serviço {in_def_f_s} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Serviço reduzido',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Serviço reduzido',
			},
		},
	},

	'POLICE_ACTIVITY:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Atividade policial exige o encurtamento {of_def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'POLICE_ACTIVITY:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a atividade policial, verificam-se atrasos significativos {in_def_f_s} {agency_title}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a atividade policial, verificam-se atrasos significativos {in_def_f_s} {agency_title}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{agency_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{agency_title} | Atrasos significativos',
			},
		},
	},

	'POLICE_ACTIVITY:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a atividade policial, verificam-se atrasos significativos {in_def_f_p} {lines_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a atividade policial, verificam-se atrasos significativos {in_def_f_s} {lines_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Atrasos significativos',
			},
		},
	},

	'POLICE_ACTIVITY:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a atividade policial, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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
				pt: 'Desacatos provocam desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
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
				pt: 'Devido a um desacato foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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
				pt: 'Desacato provoca o encurtamento {of_def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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
				pt: 'Devido a um desacato no veículo, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'ROAD_ISSUE:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, a acessibilidade para passageiros PMR está comprometida {in_def_f_p} {lines_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {lines_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Acessibilidade comprometida',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Acessibilidade comprometida',
			},
		},
	},

	'ROAD_ISSUE:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'ROAD_ISSUE:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, a acessibilidade para passageiros PMR está comprometida {in_def_f_p} {stops_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {stops_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Acessibilidade comprometida',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Acessibilidade comprometida',
			},
		},
	},

	'ROAD_ISSUE:DETOUR:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Uma obstrução na estrada obriga ao desvio de percurso {in_def_f_p} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Uma obstrução na estrada obriga ao desvio de percurso {in_def_f_s} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
		},
	},

	'ROAD_ISSUE:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Uma obstrução na estrada obriga ao desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Uma obstrução na estrada obriga ao desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
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

	'ROAD_ISSUE:DETOUR:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Uma obstrução na estrada obriga ao desvio de percurso que afeta {def_f_p} {stops_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Uma obstrução na estrada obriga ao desvio de percurso que afeta {def_f_s} {stops_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Desvio de Percurso',
			},
		},
	},

	'ROAD_ISSUE:NO_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada foi necessário cancelar o serviço {in_def_f_p} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada foi necessário cancelar o serviço {in_def_f_s} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Serviço cancelado',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Serviço cancelado',
			},
		},
	},

	'ROAD_ISSUE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'ROAD_ISSUE:NO_SERVICE:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, {def_f_p} {stops_description_pt} não serão servidas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, {def_f_s} {stops_description_pt} não será servida. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Paragens não servidas',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Paragem não servida',
			},
		},
	},

	'ROAD_ISSUE:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Uma obstrução na estrada impede a passagem e por isso é necessário reduzir o serviço {in_def_f_p} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Uma obstrução na estrada impede a passagem e por isso é necessário reduzir o serviço {in_def_f_s} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Serviço reduzido',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Serviço reduzido',
			},
		},
	},

	'ROAD_ISSUE:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Uma obstrução na estrada impede a passagem e por isso é necessário encurtar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Uma obstrução na estrada impede a passagem e por isso é necessário encurtar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'ROAD_ISSUE:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Uma obstrução na estrada impede a passagem e por isso é necessário reduzir o serviço {in_def_f_p} {stops_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Uma obstrução na estrada impede a passagem e por isso é necessário reduzir o serviço {in_def_f_s} {stops_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Serviço reduzido',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Serviço reduzido',
			},
		},
	},

	'ROAD_ISSUE:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, verificam-se atrasos significativos {in_def_f_p} {lines_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, verificam-se atrasos significativos {in_def_f_s} {lines_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Atrasos significativos',
			},
		},
	},

	'ROAD_ISSUE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'ROAD_ISSUE:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, verificam-se atrasos significativos {in_def_f_p} {stops_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, verificam-se atrasos significativos {in_def_f_s} {stops_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Atrasos significativos',
			},
		},
	},

	'ROAD_ISSUE:STOP_MOVED:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, a acessibilidade para passageiros PMR está comprometida {in_def_f_p} {stops_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a uma obstrução na estrada, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {stops_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Acessibilidade comprometida',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Acessibilidade comprometida',
			},
		},
	},

	'STRIKE:ADDITIONAL_SERVICE:agency': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido à realização de greve, foram adicionados novos horários {in_def_f_s} {agency_title}. Consulte o site carrismetropolitana.pt para mais informações.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido à realização de greve, foram adicionados novos horários {in_def_f_s} {agency_title}. Consulte o site carrismetropolitana.pt para mais informações.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{agency_title} | Horários adicionais',
			},
			singular: {
				en: 'not-available',
				pt: '{agency_title} | Horários adicionais',
			},
		},
	},

	'STRIKE:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido à realização de greve, será realizado um desdobramento {of_def_f_s} {rides_description_pt}. Consulte o site carrismetropolitana.pt para mais informações.',
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

	'STRIKE:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido à realização de greve, foram adicionados novos horários {in_def_f_p} {stops_description_pt}. Consulte o site carrismetropolitana.pt para mais informações.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido à realização de greve, foram adicionados novos horários {in_def_f_s} {stops_description_pt}. Consulte o site carrismetropolitana.pt para mais informações.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Horários adicionais',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Horários adicionais',
			},
		},
	},

	'STRIKE:DETOUR:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Por motivos de greve é necessário efetuar um desvio de percurso {in_def_f_p} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Por motivos de greve é necessário efetuar um desvio de percurso {in_def_f_s} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
		},
	},

	'STRIKE:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Por motivos de greve é necessário efetuar um desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
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

	'STRIKE:DETOUR:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Por motivos de greve é necessário efetuar um desvio de percurso que afeta {def_f_p} {stops_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Por motivos de greve é necessário efetuar um desvio de percurso que afeta {def_f_s} {stops_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Desvio de Percurso',
			},
		},
	},

	'STRIKE:NO_SERVICE:agency': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Por motivos de greve foi necessário cancelar o serviço {in_def_f_s} {agency_title}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Por motivos de greve foi necessário cancelar o serviço {in_def_f_s} {agency_title}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{agency_title} | Serviço cancelado',
			},
			singular: {
				en: 'not-available',
				pt: '{agency_title} | Serviço cancelado',
			},
		},
	},

	'STRIKE:NO_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Por motivos de greve foi necessário cancelar o serviço {in_def_f_p} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Por motivos de greve foi necessário cancelar o serviço {in_def_f_s} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Serviço cancelado',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Serviço cancelado',
			},
		},
	},

	'STRIKE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Por motivos de greve foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'STRIKE:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Por motivo de greve é necessário reduzir o serviço {in_def_f_p} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Por motivo de greve é necessário reduzir o serviço {in_def_f_s} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Serviço reduzido',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Serviço reduzido',
			},
		},
	},

	'STRIKE:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Por motivo de greve é necessário encurtar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'STRIKE:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Por motivos de greve, verificam-se atrasos significativos {in_def_f_s} {agency_title}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Por motivos de greve, verificam-se atrasos significativos {in_def_f_s} {agency_title}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{agency_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{agency_title} | Atrasos significativos',
			},
		},
	},

	'STRIKE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Por motivos de greve, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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
				pt: 'Devido a um problema técnico, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
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
				pt: 'Um problema técnico obrigou ao cancelamento {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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
				pt: 'Um problema técnico está a impedir o funcionamento normal dos sistemas de venda a bordo {in_def_f_s} {rides_description_pt}. Lamentamos o incómodo causado enquanto restabelecemos o funcionamento normal.',
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

	'TECHNICAL_ISSUE:REALTIME_INFO_ISSUE:agency': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um problema técnico está a impedir o funcionamento normal dos sistemas de localização em tempo real {in_def_f_s} {agency_title}. Lamentamos o incómodo causado enquanto restabelecemos o funcionamento normal.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um problema técnico está a impedir o funcionamento normal dos sistemas de localização em tempo real {in_def_f_s} {agency_title}. Lamentamos o incómodo causado enquanto restabelecemos o funcionamento normal.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{agency_title} | Tempo real indisponível',
			},
			singular: {
				en: 'not-available',
				pt: '{agency_title} | Tempo real indisponível',
			},
		},
	},

	'TECHNICAL_ISSUE:REALTIME_INFO_ISSUE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um problema técnico está a impedir o funcionamento normal dos sistemas de localização em tempo real {in_def_f_s} {rides_description_pt}. Lamentamos o incómodo causado enquanto restabelecemos o funcionamento normal.',
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
				pt: 'Um problema técnico obriga a encurtar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'TECHNICAL_ISSUE:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um problema técnico, verificam-se atrasos significativos {in_def_f_s} {agency_title}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um problema técnico, verificam-se atrasos significativos {in_def_f_s} {agency_title}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{agency_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{agency_title} | Atrasos significativos',
			},
		},
	},

	'TECHNICAL_ISSUE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um problema técnico, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um problema técnico, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'TRAFFIC_JAM:DETOUR:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Elevado volume de trânsito inesperado exige um desvio de percurso {in_def_f_p} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Elevado volume de trânsito inesperado exige um desvio de percurso {in_def_f_s} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
		},
	},

	'TRAFFIC_JAM:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Elevado volume de trânsito inesperado exige um desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
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

	'TRAFFIC_JAM:DETOUR:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Elevado volume de trânsito inesperado exige um desvio de percurso que afeta {def_f_p} {stops_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Elevado volume de trânsito inesperado exige um desvio de percurso que afeta {def_f_s} {stops_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Desvio de Percurso',
			},
		},
	},

	'TRAFFIC_JAM:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a atrasos excessivos provocados por elevado volume de trânsito inesperado, foi necessário cancelar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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
				pt: 'Trânsito excessivo exige encurtar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'TRAFFIC_JAM:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido ao elevado volume de trânsito, verificam-se atrasos significativos {in_def_f_s} {agency_title}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido ao elevado volume de trânsito, verificam-se atrasos significativos {in_def_f_s} {agency_title}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{agency_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{agency_title} | Atrasos significativos',
			},
		},
	},

	'TRAFFIC_JAM:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido ao elevado volume de trânsito, verificam-se atrasos significativos {in_def_f_p} {lines_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido ao elevado volume de trânsito, verificam-se atrasos significativos {in_def_f_s} {lines_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Atrasos significativos',
			},
		},
	},

	'TRAFFIC_JAM:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido ao elevado volume de trânsito, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido ao elevado volume de trânsito, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'TRAFFIC_JAM:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido ao elevado volume de trânsito, verificam-se atrasos significativos {in_def_f_p} {stops_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido ao elevado volume de trânsito, verificam-se atrasos significativos {in_def_f_s} {stops_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Atrasos significativos',
			},
		},
	},

	'VEHICLE_ISSUE:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um problema com o veículo, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um problema com o veículo, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'VEHICLE_ISSUE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um problema com o veículo obrigou ao cancelamento {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um problema com o veículo obrigou ao cancelamento {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'VEHICLE_ISSUE:ON_BOARD_SALE_ISSUE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um problema com o veículo está a impedir o funcionamento normal dos sistemas de venda a bordo {in_def_f_s} {rides_description_pt}. Lamentamos o incómodo causado enquanto restabelecemos o funcionamento normal.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um problema com o veículo está a impedir o funcionamento normal dos sistemas de venda a bordo {in_def_f_s} {rides_description_pt}. Lamentamos o incómodo causado enquanto restabelecemos o funcionamento normal.',
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

	'VEHICLE_ISSUE:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um problema com o veículo obriga a encurtar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um problema com o veículo obriga a encurtar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'VEHICLE_ISSUE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um problema com o veículo, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um problema com o veículo, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'WEATHER:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas, a acessibilidade para passageiros PMR está comprometida {in_def_f_p} {lines_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {lines_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Acessibilidade comprometida',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Acessibilidade comprometida',
			},
		},
	},

	'WEATHER:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {rides_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'WEATHER:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas, a acessibilidade para passageiros PMR está comprometida {in_def_f_p} {stops_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {stops_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Acessibilidade comprometida',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Acessibilidade comprometida',
			},
		},
	},

	'WEATHER:DETOUR:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Condições metereológicas adversas exigem um desvio de percurso {in_def_f_p} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Condições metereológicas adversas exigem um desvio de percurso {in_def_f_s} {lines_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Desvio de Percurso',
			},
		},
	},
	'WEATHER:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Condições metereológicas adversas exigem um desvio de percurso {in_def_f_s} {rides_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
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
	'WEATHER:DETOUR:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Condições metereológicas adversas exigem um desvio de percurso que afeta {def_f_p} {stops_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
			singular: {
				en: 'not-available',
				pt: 'Condições metereológicas adversas exigem um desvio de percurso que afeta {def_f_s} {stops_description_pt}. Agradecemos a sua compreensão enquanto a situação é normalizada.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Desvio de Percurso',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Desvio de Percurso',
			},
		},
	},
	'WEATHER:NO_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'As condições metereológicas adversas obrigaram ao cancelamento do serviço {in_def_f_p} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'As condições metereológicas adversas obrigaram ao cancelamento do serviço {in_def_f_s} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Serviço cancelado',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Serviço cancelado',
			},
		},
	},
	'WEATHER:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'As condições metereológicas adversas obrigaram ao cancelamento {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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
	'WEATHER:NO_SERVICE:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas, {def_f_p} {stops_description_pt} não serão servidas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas, {def_f_s} {stops_description_pt} não será servida. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Paragens não servidas',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Paragem não servida',
			},
		},
	},
	'WEATHER:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas verificadas é necessário reduzir o serviço {in_def_f_p} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas verificadas é necessário reduzir o serviço {in_def_f_s} {lines_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Serviço reduzido',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Serviço reduzido',
			},
		},
	},
	'WEATHER:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas verificadas é necessário encurtar {def_f_s} {rides_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
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
	'WEATHER:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas verificadas é necessário reduzir o serviço {in_def_f_p} {stops_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas verificadas é necessário reduzir o serviço {in_def_f_s} {stops_description_pt}. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Serviço reduzido',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Serviço reduzido',
			},
		},
	},
	'WEATHER:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas, verificam-se atrasos significativos {in_def_f_s} {agency_title}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas, verificam-se atrasos significativos {in_def_f_s} {agency_title}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{agency_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{agency_title} | Atrasos significativos',
			},
		},
	},
	'WEATHER:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas, verificam-se atrasos significativos {in_def_f_p} {lines_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas, verificam-se atrasos significativos {in_def_f_s} {lines_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{lines_title} | Atrasos significativos',
			},
		},
	},
	'WEATHER:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas, verificam-se atrasos significativos {in_def_f_s} {rides_description_pt}. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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
	'WEATHER:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas, verificam-se atrasos significativos {in_def_f_p} {stops_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas, verificam-se atrasos significativos {in_def_f_s} {stops_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Atrasos significativos',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Atrasos significativos',
			},
		},
	},
	'WEATHER:STOP_MOVED:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas, a acessibilidade para passageiros PMR está comprometida {in_def_f_p} {stops_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido às condições metereológicas adversas, a acessibilidade para passageiros PMR está comprometida {in_def_f_s} {stops_description_pt}. Por favor contacte a linha de apoio para alternativas. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{stops_title} | Acessibilidade comprometida',
			},
			singular: {
				en: 'not-available',
				pt: '{stops_title} | Acessibilidade comprometida',
			},
		},
	},
};
