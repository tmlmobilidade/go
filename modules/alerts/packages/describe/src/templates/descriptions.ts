/* * */

import { type AlertConfigKey, type TemplateFragment } from '@/types/types.js';

/**
 * Alert i18n templates registry.
 * Each key is formed by the combination of cause, effect and reference_type
 * of an alert in the format: 'CAUSE:EFFECT:REFERENCE_TYPE'
 */
export const alertI18nTemplates: Record<AlertConfigKey, TemplateFragment> = {

	'ACCIDENT:DETOUR:agency': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um acidente rodoviário está provocar desvios de percurso para a Área 1. Agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um acidente rodoviário está provocar desvios de percurso para a Área 1. Agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{agency} | Desvio de Percurso - Acidente',
			},
			singular: {
				en: 'not-available',
				pt: '{agency} | Desvio de Percurso - Acidente',
			},
		},
	},

	'ACCIDENT:DETOUR:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um acidente rodoviário está a provocar um desvio de percurso para as linhas {lines}. Agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um acidente rodoviário está a provocar um desvio de percurso para as linhas {lines}. Agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines} | Desvio de Percurso - Acidente',
			},
			singular: {
				en: 'not-available',
				pt: '{lines} | Desvio de Percurso - Acidente',
			},
		},
	},

	'ACCIDENT:DETOUR:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um acidente rodoviário está a causar um desvio de percurso na viagem das 8h da linha 123, com destino a Sapaçal. De momento, ainda não há previsão para a normalização da situação. Agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um acidente rodoviário está a causar um desvio de percurso na viagem das 8h da linha 123, com destino a Sapaçal. De momento, ainda não há previsão para a normalização da situação. Agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines} | Desvio de Percurso devido a Acidente Rodoviário',
			},
			singular: {
				en: 'not-available',
				pt: '{lines} | Desvio de Percurso devido a Acidente Rodoviário',
			},
		},
	},

	'ACCIDENT:DETOUR:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Um acidente rodoviário está a causar um desvio de percurso na viagem das 8h da linha 123, com destino a Sapaçal. De momento, ainda não há previsão para a normalização da situação. Agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Um acidente rodoviário está a causar um desvio de percurso na viagem das 8h da linha 123, com destino a Sapaçal. De momento, ainda não há previsão para a normalização da situação. Agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines} | Desvio de Percurso - Acidente',
			},
			singular: {
				en: 'not-available',
				pt: '{lines} | Desvio de Percurso - Acidente',
			},
		},
	},

	'ACCIDENT:NO_SERVICE:agency': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente, as linhas {lines} encontram-se temporariamente suspensas. Os passageiros deverão recorrer a percursos alternativos. Consulte o site ou a app Carris Metropolitana.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um acidente, as linhas {lines} encontram-se temporariamente suspensas. Os passageiros deverão recorrer a percursos alternativos. Consulte o site ou a app Carris Metropolitana.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines} | Serviço Suspenso - Acidente',
			},
			singular: {
				en: 'not-available',
				pt: '{lines} | Serviço Suspenso - Acidente',
			},
		},
	},

	'ACCIDENT:NO_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente, as linhas {lines} encontram-se temporariamente suspensas. Os passageiros deverão recorrer a percursos alternativos. Consulte o site ou a app Carris Metropolitana.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um acidente, as linhas {lines} encontram-se temporariamente suspensas. Os passageiros deverão recorrer a percursos alternativos. Consulte o site ou a app Carris Metropolitana.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines} | Serviço Suspenso - Acidente',
			},
			singular: {
				en: 'not-available',
				pt: '{lines} | Serviço Suspenso - Acidente',
			},
		},
	},

	'ACCIDENT:NO_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente rodoviário, a viagem das 8h da linha 123, com destino a Sapaçal, encontra-se cancelada. Devido à natureza da situação não será possível encontrar uma substituição, pelo que é recomendado recorrer a percursos alternativos. Lamentamos o incómodo causado e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um acidente rodoviário, a viagem das 8h da linha 123, com destino a Sapaçal, encontra-se cancelada. Devido à natureza da situação não será possível encontrar uma substituição, pelo que é recomendado recorrer a percursos alternativos. Lamentamos o incómodo causado e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines} | Viagem cancelada devido a acidente',
			},
			singular: {
				en: 'not-available',
				pt: '{lines} | Viagem cancelada devido a acidente',
			},
		},
	},

	'ACCIDENT:NO_SERVICE:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente rodoviário, a viagem das 8h da linha 123, com destino a Sapaçal, encontra-se cancelada. Devido à natureza da situação não será possível encontrar uma substituição, pelo que é recomendado recorrer a percursos alternativos. Lamentamos o incómodo causado e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um acidente rodoviário, a viagem das 8h da linha 123, com destino a Sapaçal, encontra-se cancelada. Devido à natureza da situação não será possível encontrar uma substituição, pelo que é recomendado recorrer a percursos alternativos. Lamentamos o incómodo causado e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines} | Viagem cancelada devido a acidente',
			},
			singular: {
				en: 'not-available',
				pt: '{lines} | Viagem cancelada devido a acidente',
			},
		},
	},

	'ACCIDENT:REDUCED_SERVICE:agency': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente rodoviário, as  linhas {lines}  terão o seu serviço reduzido.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um acidente rodoviário, as  linhas {lines}  terão o seu serviço reduzido.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines} | Serviço Reduzido - Acidente',
			},
			singular: {
				en: 'not-available',
				pt: '{lines} | Serviço Reduzido - Acidente',
			},
		},
	},

	'ACCIDENT:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente rodoviário, as  linhas {lines}  terão o seu serviço reduzido.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um acidente rodoviário, as  linhas {lines}  terão o seu serviço reduzido.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines} | Serviço Reduzido - Acidente',
			},
			singular: {
				en: 'not-available',
				pt: '{lines} | Serviço Reduzido - Acidente',
			},
		},
	},

	'ACCIDENT:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente rodoviário, a viagem das 8h da linha 123, com destino a Sapaçal, terá o percurso encurtado. Algumas paragens não serão efetuadas. Lamentamos o incóomodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um acidente rodoviário, a viagem das 8h da linha 123, com destino a Sapaçal, terá o percurso encurtado. Algumas paragens não serão efetuadas. Lamentamos o incóomodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines} | Serviço Reduzido - Acidente',
			},
			singular: {
				en: 'not-available',
				pt: '{lines} | Serviço Reduzido - Acidente',
			},
		},
	},

	'ACCIDENT:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente, as  linhas {lines}  terão o seu serviço reduzido.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um acidente, as  linhas {lines}  terão o seu serviço reduzido.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines} | Serviço Reduzido - Acidente',
			},
			singular: {
				en: 'not-available',
				pt: '{lines} | Serviço Reduzido - Acidente',
			},
		},
	},

	'ACCIDENT:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente, as linhas {lines} poderão sofrer atrasos significativos. Pedimos a compreensão de todos.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um acidente, as linhas {lines} poderão sofrer atrasos significativos. Pedimos a compreensão de todos.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines} | Atrasos Significativos - Acidente',
			},
			singular: {
				en: 'not-available',
				pt: '{lines} | Atrasos Significativos - Acidente',
			},
		},
	},

	'ACCIDENT:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente, as linhas {lines} poderão sofrer atrasos significativos. Pedimos a compreensão de todos.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um acidente, as linhas {lines} poderão sofrer atrasos significativos. Pedimos a compreensão de todos.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines} | Atrasos Significativos - Acidente',
			},
			singular: {
				en: 'not-available',
				pt: '{lines} | Atrasos Significativos - Acidente',
			},
		},
	},

	'ACCIDENT:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente rodoviário, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um acidente rodoviário, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines} | Atrasos Significativos - Acidente',
			},
			singular: {
				en: 'not-available',
				pt: '{lines} | Atrasos Significativos - Acidente',
			},
		},
	},

	'ACCIDENT:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um acidente, as linhas {lines} poderão sofrer atrasos significativos. Pedimos a compreensão de todos.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um acidente, as linhas {lines} poderão sofrer atrasos significativos. Pedimos a compreensão de todos.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: '{lines} | Atrasos Significativos - Acidente',
			},
			singular: {
				en: 'not-available',
				pt: '{lines} | Atrasos Significativos - Acidente',
			},
		},
	},

	'CONSTRUCTION:ACCESSIBILITY_ISSUE:agency': {
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

	'CONSTRUCTION:ACCESSIBILITY_ISSUE:lines': {
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

	'CONSTRUCTION:ACCESSIBILITY_ISSUE:rides': {
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

	'CONSTRUCTION:ACCESSIBILITY_ISSUE:stops': {
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

	'CONSTRUCTION:DETOUR:agency': {
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

	'CONSTRUCTION:DETOUR:lines': {
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

	'CONSTRUCTION:DETOUR:stops': {
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

	'CONSTRUCTION:NO_SERVICE:agency': {
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

	'CONSTRUCTION:NO_SERVICE:lines': {
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

	'CONSTRUCTION:NO_SERVICE:stops': {
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

	'CONSTRUCTION:REDUCED_SERVICE:agency': {
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

	'CONSTRUCTION:REDUCED_SERVICE:lines': {
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

	'CONSTRUCTION:REDUCED_SERVICE:rides': {
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

	'CONSTRUCTION:REDUCED_SERVICE:stops': {
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

	'CONSTRUCTION:SIGNIFICANT_DELAYS:agency': {
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

	'CONSTRUCTION:SIGNIFICANT_DELAYS:lines': {
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

	'CONSTRUCTION:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a obras, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a obras, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'CONSTRUCTION:SIGNIFICANT_DELAYS:stops': {
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

	'CONSTRUCTION:STOP_MOVED:agency': {
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

	'CONSTRUCTION:STOP_MOVED:lines': {
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

	'CONSTRUCTION:STOP_MOVED:stops': {
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

	'DEMONSTRATION:ACCESSIBILITY_ISSUE:agency': {
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

	'DEMONSTRATION:ACCESSIBILITY_ISSUE:lines': {
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

	'DEMONSTRATION:ACCESSIBILITY_ISSUE:stops': {
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

	'DEMONSTRATION:ADDITIONAL_SERVICE:agency': {
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

	'DEMONSTRATION:ADDITIONAL_SERVICE:lines': {
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

	'DEMONSTRATION:ADDITIONAL_SERVICE:stops': {
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

	'DEMONSTRATION:DETOUR:agency': {
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

	'DEMONSTRATION:DETOUR:lines': {
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

	'DEMONSTRATION:DETOUR:stops': {
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

	'DEMONSTRATION:NO_SERVICE:agency': {
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

	'DEMONSTRATION:NO_SERVICE:lines': {
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

	'DEMONSTRATION:NO_SERVICE:stops': {
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

	'DEMONSTRATION:REDUCED_SERVICE:agency': {
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

	'DEMONSTRATION:REDUCED_SERVICE:lines': {
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

	'DEMONSTRATION:REDUCED_SERVICE:rides': {
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

	'DEMONSTRATION:REDUCED_SERVICE:stops': {
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

	'DEMONSTRATION:SIGNIFICANT_DELAYS:agency': {
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

	'DEMONSTRATION:SIGNIFICANT_DELAYS:lines': {
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

	'DEMONSTRATION:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um evento, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um evento, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'DEMONSTRATION:SIGNIFICANT_DELAYS:stops': {
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

	'DRIVER_ABSENCE:NO_SERVICE:agency': {
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

	'DRIVER_ABSENCE:NO_SERVICE:lines': {
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

	'DRIVER_ABSENCE:NO_SERVICE:rides': {
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

	'DRIVER_ABSENCE:NO_SERVICE:stops': {
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

	'DRIVER_ABSENCE:SIGNIFICANT_DELAYS:agency': {
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

	'DRIVER_ABSENCE:SIGNIFICANT_DELAYS:lines': {
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

	'DRIVER_ABSENCE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a uma questão operacional, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a uma questão operacional, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'DRIVER_ABSENCE:SIGNIFICANT_DELAYS:stops': {
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

	'DRIVER_ISSUE:DETOUR:agency': {
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

	'DRIVER_ISSUE:DETOUR:lines': {
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

	'DRIVER_ISSUE:DETOUR:stops': {
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

	'DRIVER_ISSUE:NO_SERVICE:agency': {
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

	'DRIVER_ISSUE:NO_SERVICE:lines': {
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

	'DRIVER_ISSUE:NO_SERVICE:stops': {
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

	'DRIVER_ISSUE:REDUCED_SERVICE:agency': {
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

	'DRIVER_ISSUE:REDUCED_SERVICE:lines': {
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

	'DRIVER_ISSUE:REDUCED_SERVICE:rides': {
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

	'DRIVER_ISSUE:REDUCED_SERVICE:stops': {
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

	'DRIVER_ISSUE:SIGNIFICANT_DELAYS:agency': {
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

	'DRIVER_ISSUE:SIGNIFICANT_DELAYS:lines': {
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

	'DRIVER_ISSUE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a uma questão operacional, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a uma questão operacional, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'DRIVER_ISSUE:SIGNIFICANT_DELAYS:stops': {
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

	'HIGH_PASSENGER_LOAD:ACCESSIBILITY_ISSUE:agency': {
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

	'HIGH_PASSENGER_LOAD:ACCESSIBILITY_ISSUE:lines': {
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

	'HIGH_PASSENGER_LOAD:ACCESSIBILITY_ISSUE:rides': {
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

	'HIGH_PASSENGER_LOAD:ACCESSIBILITY_ISSUE:stops': {
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

	'HIGH_PASSENGER_LOAD:ADDITIONAL_SERVICE:agency': {
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

	'HIGH_PASSENGER_LOAD:ADDITIONAL_SERVICE:lines': {
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

	'HIGH_PASSENGER_LOAD:ADDITIONAL_SERVICE:stops': {
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

	'HIGH_PASSENGER_LOAD:SIGNIFICANT_DELAYS:agency': {
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

	'HIGH_PASSENGER_LOAD:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido ao elevado volume de passageiros, há atrasos significativos {in_def_f_p} {lines_description_pt}. O serviço não foi cancelado e deverá retomar assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido ao elevado volume de passageiros, há atrasos significativos {in_def_f_s} {lines_description_pt}. O serviço não foi cancelado e deverá retomar assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'HIGH_PASSENGER_LOAD:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'Due to high passenger volume, {rides_description_pt} is experiencing significant delays. The ride has not been canceled and is expected to proceed once the issue is resolved. We apologize for the inconvenience and appreciate your understanding.',
				pt: 'Devido ao elevado volume de passageiros, há atrasos significativos {in_def_f_p} {rides_description_pt}. As viagens não foram canceladas e deverão realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'Due to high passenger volume, {rides_description_pt} is experiencing significant delays. The ride has not been canceled and is expected to proceed once the issue is resolved. We apologize for the inconvenience and appreciate your understanding.',
				pt: 'Devido ao elevado volume de passageiros, há atrasos significativos {in_def_f_s} {rides_description_pt}. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'HIGH_PASSENGER_LOAD:SIGNIFICANT_DELAYS:stops': {
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

	'MEDICAL_EMERGENCY:DETOUR:agency': {
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

	'MEDICAL_EMERGENCY:DETOUR:lines': {
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

	'MEDICAL_EMERGENCY:DETOUR:stops': {
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

	'MEDICAL_EMERGENCY:NO_SERVICE:agency': {
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

	'MEDICAL_EMERGENCY:NO_SERVICE:lines': {
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

	'MEDICAL_EMERGENCY:NO_SERVICE:stops': {
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

	'MEDICAL_EMERGENCY:REDUCED_SERVICE:agency': {
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

	'MEDICAL_EMERGENCY:REDUCED_SERVICE:lines': {
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

	'MEDICAL_EMERGENCY:REDUCED_SERVICE:rides': {
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

	'MEDICAL_EMERGENCY:REDUCED_SERVICE:stops': {
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

	'MEDICAL_EMERGENCY:SIGNIFICANT_DELAYS:agency': {
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

	'MEDICAL_EMERGENCY:SIGNIFICANT_DELAYS:lines': {
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

	'MEDICAL_EMERGENCY:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a uma emergência médica, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a uma emergência médica, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'MEDICAL_EMERGENCY:SIGNIFICANT_DELAYS:stops': {
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

	'POLICE_ACTIVITY:DETOUR:agency': {
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

	'POLICE_ACTIVITY:DETOUR:lines': {
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

	'POLICE_ACTIVITY:DETOUR:stops': {
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

	'POLICE_ACTIVITY:NO_SERVICE:agency': {
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

	'POLICE_ACTIVITY:NO_SERVICE:lines': {
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

	'POLICE_ACTIVITY:NO_SERVICE:stops': {
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

	'POLICE_ACTIVITY:REDUCED_SERVICE:agency': {
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

	'POLICE_ACTIVITY:REDUCED_SERVICE:lines': {
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

	'POLICE_ACTIVITY:REDUCED_SERVICE:rides': {
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

	'POLICE_ACTIVITY:REDUCED_SERVICE:stops': {
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

	'POLICE_ACTIVITY:SIGNIFICANT_DELAYS:agency': {
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

	'POLICE_ACTIVITY:SIGNIFICANT_DELAYS:lines': {
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

	'POLICE_ACTIVITY:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a atividade policial, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a atividade policial, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'POLICE_ACTIVITY:SIGNIFICANT_DELAYS:stops': {
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

	'PUBLIC_DISORDER:DETOUR:agency': {
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

	'PUBLIC_DISORDER:DETOUR:lines': {
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

	'PUBLIC_DISORDER:DETOUR:stops': {
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

	'PUBLIC_DISORDER:NO_SERVICE:agency': {
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

	'PUBLIC_DISORDER:NO_SERVICE:lines': {
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

	'PUBLIC_DISORDER:NO_SERVICE:stops': {
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

	'PUBLIC_DISORDER:REDUCED_SERVICE:agency': {
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

	'PUBLIC_DISORDER:REDUCED_SERVICE:lines': {
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

	'PUBLIC_DISORDER:REDUCED_SERVICE:rides': {
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

	'PUBLIC_DISORDER:REDUCED_SERVICE:stops': {
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

	'PUBLIC_DISORDER:SIGNIFICANT_DELAYS:agency': {
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

	'PUBLIC_DISORDER:SIGNIFICANT_DELAYS:lines': {
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

	'PUBLIC_DISORDER:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um desacato, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um desacato, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'PUBLIC_DISORDER:SIGNIFICANT_DELAYS:stops': {
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

	'ROAD_ISSUE:ACCESSIBILITY_ISSUE:agency': {
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

	'ROAD_ISSUE:ACCESSIBILITY_ISSUE:lines': {
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

	'ROAD_ISSUE:ACCESSIBILITY_ISSUE:rides': {
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

	'ROAD_ISSUE:ACCESSIBILITY_ISSUE:stops': {
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

	'ROAD_ISSUE:DETOUR:agency': {
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

	'ROAD_ISSUE:DETOUR:lines': {
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

	'ROAD_ISSUE:DETOUR:stops': {
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

	'ROAD_ISSUE:NO_SERVICE:agency': {
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

	'ROAD_ISSUE:NO_SERVICE:lines': {
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

	'ROAD_ISSUE:NO_SERVICE:stops': {
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

	'ROAD_ISSUE:REDUCED_SERVICE:agency': {
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

	'ROAD_ISSUE:REDUCED_SERVICE:lines': {
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

	'ROAD_ISSUE:REDUCED_SERVICE:rides': {
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

	'ROAD_ISSUE:REDUCED_SERVICE:stops': {
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

	'ROAD_ISSUE:SIGNIFICANT_DELAYS:agency': {
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

	'ROAD_ISSUE:SIGNIFICANT_DELAYS:lines': {
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

	'ROAD_ISSUE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um incidente na estrada, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um incidente na estrada, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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

	'ROAD_ISSUE:SIGNIFICANT_DELAYS:stops': {
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

	'STRIKE:ADDITIONAL_SERVICE:agency': {
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

	'STRIKE:ADDITIONAL_SERVICE:lines': {
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

	'STRIKE:ADDITIONAL_SERVICE:stops': {
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

	'STRIKE:DETOUR:agency': {
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
	'STRIKE:DETOUR:lines': {
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
	'STRIKE:DETOUR:stops': {
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
	'STRIKE:NO_SERVICE:agency': {
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
	'STRIKE:NO_SERVICE:lines': {
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
	'STRIKE:NO_SERVICE:stops': {
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
	'STRIKE:REDUCED_SERVICE:agency': {
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
	'STRIKE:REDUCED_SERVICE:lines': {
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
	'STRIKE:REDUCED_SERVICE:rides': {
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
	'STRIKE:REDUCED_SERVICE:stops': {
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
	'STRIKE:SIGNIFICANT_DELAYS:agency': {
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
	'STRIKE:SIGNIFICANT_DELAYS:lines': {
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
	'STRIKE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a greve, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a greve, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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
	'STRIKE:SIGNIFICANT_DELAYS:stops': {
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
	'TECHNICAL_ISSUE:ACCESSIBILITY_ISSUE:agency': {
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
	'TECHNICAL_ISSUE:ACCESSIBILITY_ISSUE:lines': {
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
	'TECHNICAL_ISSUE:ACCESSIBILITY_ISSUE:rides': {
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
	'TECHNICAL_ISSUE:ACCESSIBILITY_ISSUE:stops': {
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
	'TECHNICAL_ISSUE:NO_SERVICE:agency': {
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
	'TECHNICAL_ISSUE:NO_SERVICE:lines': {
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
	'TECHNICAL_ISSUE:NO_SERVICE:rides': {
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
	'TECHNICAL_ISSUE:NO_SERVICE:stops': {
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
	'TECHNICAL_ISSUE:ON_BOARD_SALE_ISSUE:agency': {
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
	'TECHNICAL_ISSUE:ON_BOARD_SALE_ISSUE:lines': {
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
	'TECHNICAL_ISSUE:ON_BOARD_SALE_ISSUE:stops': {
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
	'TECHNICAL_ISSUE:REALTIME_INFO_ISSUE:agency': {
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
	'TECHNICAL_ISSUE:REALTIME_INFO_ISSUE:lines': {
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
	'TECHNICAL_ISSUE:REALTIME_INFO_ISSUE:stops': {
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
	'TECHNICAL_ISSUE:REDUCED_SERVICE:agency': {
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
	'TECHNICAL_ISSUE:REDUCED_SERVICE:lines': {
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
	'TECHNICAL_ISSUE:REDUCED_SERVICE:stops': {
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
	'TECHNICAL_ISSUE:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um problema técnico o operador 123 está com atrasos significativos. Esperamos retomar a normalidade da operação em breve. Agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um problema técnico o operador 123 está com atrasos significativos. Esperamos retomar a normalidade da operação em breve. Agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: 'Área 1 | Problema técnico provoca atrasos significativos.',
			},
			singular: {
				en: 'not-available',
				pt: 'Área 1 | Problema técnico provoca atrasos significativos.',
			},
		},
	},
	'TECHNICAL_ISSUE:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um problema técnico, as linhas 123 e 123 estão a sofrer atrasos significativos. Esperamos retomar a normalidade da operação em breve. Agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um problema técnico, a linha 123 está a sofrer atrasos significativos. Esperamos retomar a normalidade da operação em breve. Agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: 'Linhas 123, 123 | Problema técnico provoca atrasos significativos.',
			},
			singular: {
				en: 'not-available',
				pt: 'Linha 123 | Problema técnico provoca atrasos significativos.',
			},
		},
	},
	'TECHNICAL_ISSUE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a um problema técnico, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a um problema técnico, a viagem das 8h da linha 123 com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
		},
		title: {
			plural: {
				en: 'not-available',
				pt: 'Linhas 123, 123 | Atraso significativo',
			},
			singular: {
				en: 'not-available',
				pt: 'Linha 123 | Atraso significativo',
			},
		},
	},
	'TECHNICAL_ISSUE:SIGNIFICANT_DELAYS:stops': {
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
	'TRAFFIC_JAM:DETOUR:agency': {
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
	'TRAFFIC_JAM:DETOUR:lines': {
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
	'TRAFFIC_JAM:DETOUR:stops': {
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
	'TRAFFIC_JAM:NO_SERVICE:agency': {
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
	'TRAFFIC_JAM:NO_SERVICE:lines': {
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
	'TRAFFIC_JAM:NO_SERVICE:stops': {
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
	'TRAFFIC_JAM:REDUCED_SERVICE:agency': {
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
	'TRAFFIC_JAM:REDUCED_SERVICE:lines': {
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
	'TRAFFIC_JAM:REDUCED_SERVICE:rides': {
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
	'TRAFFIC_JAM:REDUCED_SERVICE:stops': {
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
	'TRAFFIC_JAM:SIGNIFICANT_DELAYS:agency': {
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
	'TRAFFIC_JAM:SIGNIFICANT_DELAYS:lines': {
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
	'TRAFFIC_JAM:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: 'not-available',
				pt: 'Devido a trânsito inesperado, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
			},
			singular: {
				en: 'not-available',
				pt: 'Devido a trânsito inesperado, a viagem das 8h da linha 123 com destino a Sapaçal, e a viagem das 9h com destino a Sapaçal, encontra-se com atraso significativo. A viagem não foi cancelada e deverá realizar-se assim que o problema seja resolvido. Lamentamos o incómodo e agradecemos a sua compreensão.',
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
	'TRAFFIC_JAM:SIGNIFICANT_DELAYS:stops': {
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
	'WEATHER:ACCESSIBILITY_ISSUE:agency': {
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
	'WEATHER:ACCESSIBILITY_ISSUE:lines': {
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
	'WEATHER:ACCESSIBILITY_ISSUE:rides': {
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
	'WEATHER:ACCESSIBILITY_ISSUE:stops': {
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
	'WEATHER:DETOUR:agency': {
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
	'WEATHER:DETOUR:lines': {
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
	'WEATHER:DETOUR:stops': {
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
	'WEATHER:NO_SERVICE:agency': {
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
	'WEATHER:NO_SERVICE:lines': {
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
	'WEATHER:NO_SERVICE:stops': {
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
	'WEATHER:REDUCED_SERVICE:agency': {
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
	'WEATHER:REDUCED_SERVICE:lines': {
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
	'WEATHER:REDUCED_SERVICE:rides': {
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
	'WEATHER:REDUCED_SERVICE:stops': {
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
	'WEATHER:SIGNIFICANT_DELAYS:agency': {
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
	'WEATHER:SIGNIFICANT_DELAYS:lines': {
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
	'WEATHER:SIGNIFICANT_DELAYS:rides': {
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
	'WEATHER:SIGNIFICANT_DELAYS:stops': {
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
};
