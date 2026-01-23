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
				en: { placeholders: ['*LINES*'], text: 'Due to a road accident, *LINES* are being temporarily detoured to continue service. We appreciate your understanding.' },
				pt: { placeholders: ['*LINES*'], text: 'Devido a um acidente rodoviário, *LINES* estão a ser temporariamente desviadas para continuar o serviço. Agradecemos a sua compreensão.' },
			},
			singular: {
				en: { placeholders: ['*LINES*'], text: 'Due to a road accident, accessibility services on the line *LINES* have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['*LINES*'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha *LINES* foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['*LINES*'], text: '*LINES* | Road accident affects accessibility services' },
				pt: { placeholders: ['*LINES*'], text: '*LINES* | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['*LINES*'], text: '*LINES* | Road accident affects accessibility services' },
				pt: { placeholders: ['*LINES*'], text: '*LINES* | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'ACCIDENT:DETOUR:lines': {
		description: {
			plural: {
				en: { placeholders: ['*LINES*'], text: 'Due to a road accident, the lines *LINES* are operating on a detour while this notice is in effect. Please follow posted signage or contact our customer service for guidance. We appreciate your patience as we manage the situation.' },
				pt: { placeholders: ['*LINES*'], text: 'Devido a um acidente rodoviário, as linhas *LINES* estão a operar em desvio enquanto este aviso estiver ativo. Por favor, siga a sinalização ou entre em contacto connosco para orientação. Agradecemos a sua paciência enquanto gerimos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, the line {line_short_name} is operating on a detour while this notice is in effect. Please follow posted signage or contact our customer service for guidance. We appreciate your patience as we manage the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, a linha {line_short_name} está a operar em desvio enquanto este aviso estiver ativo. Por favor, siga a sinalização ou entre em contacto connosco para orientação. Agradecemos a sua paciência enquanto gerimos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident causes temporary detour' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca desvio temporário' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident causes temporary detour' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca desvio temporário' },
			},
		},
	},

	'ACCIDENT:DETOUR:rides': {
		description: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: 'Due to a road accident, the rides {ride_short_name[]} are operating on a detour while this notice is in effect. Please follow updated instructions or contact our customer service for more information. We appreciate your understanding as we manage the situation.' },
				pt: { placeholders: ['{ride_short_name[]}'], text: 'Devido a um acidente rodoviário, as viagens {ride_short_name[]} estão a operar em desvio enquanto este aviso estiver ativo. Por favor, siga as instruções atualizadas ou entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: 'Due to a road accident, the ride {ride_short_name} is operating on a detour while this notice is in effect. Please follow updated instructions or contact our customer service for more information. We appreciate your understanding as we manage the situation.' },
				pt: { placeholders: ['{ride_short_name}'], text: 'Devido a um acidente rodoviário, a viagem {ride_short_name} está a operar em desvio enquanto este aviso estiver ativo. Por favor, siga as instruções atualizadas ou entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Road accident causes temporary detour' },
				pt: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Acidente provoca desvio temporário' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Road accident causes temporary detour' },
				pt: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Acidente provoca desvio temporário' },
			},
		},
	},

	'ACCIDENT:DETOUR:stops': {
		description: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: 'Due to a road accident, services at the stops {stop_name[]} are affected by a detour while this notice is in effect. Please follow posted signage or contact our customer service for further information. We appreciate your understanding as we manage the situation.' },
				pt: { placeholders: ['{stop_name[]}'], text: 'Devido a um acidente rodoviário, o serviço nas paragens {stop_name[]} encontra-se condicionado por um desvio enquanto este aviso estiver ativo. Por favor, siga a sinalização ou entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: 'Due to a road accident, service at the stop {stop_name} is affected by a detour while this notice is in effect. Please follow posted signage or contact our customer service for further information. We appreciate your understanding as we manage the situation.' },
				pt: { placeholders: ['{stop_name}'], text: 'Devido a um acidente rodoviário, o serviço na paragem {stop_name} encontra-se condicionado por um desvio enquanto este aviso estiver ativo. Por favor, siga a sinalização ou entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Road accident causes temporary detour at stops' },
				pt: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Acidente provoca desvio temporário nas paragens' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: '{stop_name} | Road accident causes temporary detour at stop' },
				pt: { placeholders: ['{stop_name}'], text: '{stop_name} | Acidente provoca desvio temporário na paragem' },
			},
		},
	},

	'ACCIDENT:NO_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'ACCIDENT:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, service on the lines {line_short_name[]} has been canceled while this notice is in effect. Please use alternative routes or contact our customer service for more information. We thank you for your understanding while we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, o serviço nas linhas {line_short_name[]} foi interrompido enquanto este aviso estiver ativo. Por favor, utilize rotas alternativas ou entre em contacto connosco para mais informações. Agradecemos desde já a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, service on the line {line_short_name} has been canceled while this notice is in effect. Please use alternative routes or contact our customer service for more information. We thank you for your understanding while we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, o serviço na linha {line_short_name} foi interrompido enquanto este aviso estiver ativo. Por favor, utilize rotas alternativas ou entre em contacto connosco para mais informações. Agradecemos desde já a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident causes temporary service disruption' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca interrupção temporária no serviço' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident causes temporary service disruption' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca interrupção temporária no serviço' },
			},
		},
	},

	'ACCIDENT:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: 'Due to a road accident, the rides {ride_short_name[]} have been canceled while this notice is in effect. Please consider alternative options or contact our customer service for more information. We thank you for your understanding while we work to resolve the situation.' },
				pt: { placeholders: ['{ride_short_name[]}'], text: 'Devido a um acidente rodoviário, as viagens {ride_short_name[]} foram canceladas enquanto este aviso estiver ativo. Por favor, considere alternativas ou entre em contacto connosco para mais informações. Agradecemos desde já a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: 'Due to a road accident, the ride {ride_short_name} has been canceled while this notice is in effect. Please consider alternative options or contact our customer service for more information. We thank you for your understanding while we work to resolve the situation.' },
				pt: { placeholders: ['{ride_short_name}'], text: 'Devido a um acidente rodoviário, a viagem {ride_short_name} foi cancelada enquanto este aviso estiver ativo. Por favor, considere alternativas ou entre em contacto connosco para mais informações. Agradecemos desde já a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Road accident causes service cancellation' },
				pt: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Acidente provoca cancelamento do serviço' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Road accident causes service cancellation' },
				pt: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Acidente provoca cancelamento do serviço' },
			},
		},
	},

	'ACCIDENT:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: 'Due to a road accident, service at the stops {stop_name[]} has been suspended while this notice is in effect. Please use nearby stops or contact our customer service for more information. We thank you for your understanding while we work to resolve the situation.' },
				pt: { placeholders: ['{stop_name[]}'], text: 'Devido a um acidente rodoviário, o serviço nas paragens {stop_name[]} foi suspenso enquanto este aviso estiver ativo. Por favor, utilize paragens próximas ou entre em contacto connosco para mais informações. Agradecemos desde já a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: 'Due to a road accident, service at the stop {stop_name} has been suspended while this notice is in effect. Please use nearby stops or contact our customer service for more information. We thank you for your understanding while we work to resolve the situation.' },
				pt: { placeholders: ['{stop_name}'], text: 'Devido a um acidente rodoviário, o serviço na paragem {stop_name} foi suspenso enquanto este aviso estiver ativo. Por favor, utilize paragens próximas ou entre em contacto connosco para mais informações. Agradecemos desde já a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Road accident causes service suspension at stops' },
				pt: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Acidente provoca suspensão do serviço nas paragens' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: '{stop_name} | Road accident causes service suspension at stop' },
				pt: { placeholders: ['{stop_name}'], text: '{stop_name} | Acidente provoca suspensão do serviço na paragem' },
			},
		},
	},

	'ACCIDENT:REDUCED_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'ACCIDENT:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, service on the lines {line_short_name[]} is operating with reduced frequency while this notice is in effect. Please plan your journey accordingly and contact our customer service for additional information. We appreciate your understanding as we manage the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, o serviço nas linhas {line_short_name[]} está a operar com frequência reduzida enquanto este aviso estiver ativo. Por favor, planeie a sua viagem em conformidade e entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, service on the line {line_short_name} is operating with reduced frequency while this notice is in effect. Please plan your journey accordingly and contact our customer service for additional information. We appreciate your understanding as we manage the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, o serviço na linha {line_short_name} está a operar com frequência reduzida enquanto este aviso estiver ativo. Por favor, planeie a sua viagem em conformidade e entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Service operating at reduced frequency due to road accident' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Serviço com frequência reduzida devido a acidente rodoviário' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Service operating at reduced frequency due to road accident' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Serviço com frequência reduzida devido a acidente rodoviário' },
			},
		},
	},

	'ACCIDENT:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: 'Due to a road accident, the rides {ride_short_name[]} are operating with reduced service while this notice is in effect. Please plan your journey accordingly and contact our customer service for more information. We appreciate your understanding as we work to manage the situation.' },
				pt: { placeholders: ['{ride_short_name[]}'], text: 'Devido a um acidente rodoviário, as viagens {ride_short_name[]} estão a operar com serviço reduzido enquanto este aviso estiver ativo. Por favor, planeie a sua viagem em conformidade e entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: 'Due to a road accident, the ride {ride_short_name} is operating with reduced service while this notice is in effect. Please plan your journey accordingly and contact our customer service for more information. We appreciate your understanding as we work to manage the situation.' },
				pt: { placeholders: ['{ride_short_name}'], text: 'Devido a um acidente rodoviário, a viagem {ride_short_name} está a operar com serviço reduzido enquanto este aviso estiver ativo. Por favor, planeie a sua viagem em conformidade e entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Service operating at reduced frequency due to road accident' },
				pt: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Serviço com frequência reduzida devido a acidente rodoviário' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Service operating at reduced frequency due to road accident' },
				pt: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Serviço com frequência reduzida devido a acidente rodoviário' },
			},
		},
	},

	'ACCIDENT:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: 'Due to a road accident, service at the stops {stop_name[]} is operating with reduced frequency while this notice is in effect. Please plan your journey accordingly and contact our customer service for more information. We appreciate your understanding as we manage the situation.' },
				pt: { placeholders: ['{stop_name[]}'], text: 'Devido a um acidente rodoviário, o serviço nas paragens {stop_name[]} está a operar com frequência reduzida enquanto este aviso estiver ativo. Por favor, planeie a sua viagem em conformidade e entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: 'Due to a road accident, service at the stop {stop_name} is operating with reduced frequency while this notice is in effect. Please plan your journey accordingly and contact our customer service for more information. We appreciate your understanding as we manage the situation.' },
				pt: { placeholders: ['{stop_name}'], text: 'Devido a um acidente rodoviário, o serviço na paragem {stop_name} está a operar com frequência reduzida enquanto este aviso estiver ativo. Por favor, planeie a sua viagem em conformidade e entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Service operating at reduced frequency due to road accident' },
				pt: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Serviço com frequência reduzida devido a acidente rodoviário' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: '{stop_name} | Service operating at reduced frequency due to road accident' },
				pt: { placeholders: ['{stop_name}'], text: '{stop_name} | Serviço com frequência reduzida devido a acidente rodoviário' },
			},
		},
	},

	'ACCIDENT:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'ACCIDENT:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, the lines {line_short_name[]} are experiencing significant delays while this notice is in effect. Please allow extra travel time and contact our customer service for the latest updates. We appreciate your patience as we manage the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, as linhas {line_short_name[]} estão a sofrer atrasos significativos enquanto este aviso estiver ativo. Por favor, reserve mais tempo para a sua viagem e entre em contacto connosco para as últimas atualizações. Agradecemos a sua paciência enquanto gerimos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, the line {line_short_name} is experiencing significant delays while this notice is in effect. Please allow extra travel time and contact our customer service for the latest updates. We appreciate your patience as we manage the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, a linha {line_short_name} está a sofrer atrasos significativos enquanto este aviso estiver ativo. Por favor, reserve mais tempo para a sua viagem e entre em contacto connosco para as últimas atualizações. Agradecemos a sua paciência enquanto gerimos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Significant delays due to road accident' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Atrasos significativos devido a acidente rodoviário' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Significant delays due to road accident' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Atrasos significativos devido a acidente rodoviário' },
			},
		},
	},

	'ACCIDENT:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: 'Due to a road accident, the rides {ride_short_name[]} are experiencing significant delays while this notice is in effect. Please allow extra travel time and contact our customer service for the latest updates. We appreciate your patience as we manage the situation.' },
				pt: { placeholders: ['{ride_short_name[]}'], text: 'Devido a um acidente rodoviário, as viagens {ride_short_name[]} estão a sofrer atrasos significativos enquanto este aviso estiver ativo. Por favor, reserve mais tempo para a sua viagem e entre em contacto connosco para as últimas atualizações. Agradecemos a sua paciência enquanto gerimos a situação.' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: 'Due to a road accident, the ride {ride_short_name} is experiencing significant delays while this notice is in effect. Please allow extra travel time and contact our customer service for the latest updates. We appreciate your patience as we manage the situation.' },
				pt: { placeholders: ['{ride_short_name}'], text: 'Devido a um acidente rodoviário, a viagem {ride_short_name} está a sofrer atrasos significativos enquanto este aviso estiver ativo. Por favor, reserve mais tempo para a sua viagem e entre em contacto connosco para as últimas atualizações. Agradecemos a sua paciência enquanto gerimos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Significant delays due to road accident' },
				pt: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Atrasos significativos devido a acidente rodoviário' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Significant delays due to road accident' },
				pt: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Atrasos significativos devido a acidente rodoviário' },
			},
		},
	},

	'ACCIDENT:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: 'Due to a road accident, services at the stops {stop_name[]} are experiencing significant delays while this notice is in effect. Please allow extra travel time and contact our customer service for updates. We appreciate your patience as we manage the situation.' },
				pt: { placeholders: ['{stop_name[]}'], text: 'Devido a um acidente rodoviário, os serviços nas paragens {stop_name[]} estão a sofrer atrasos significativos enquanto este aviso estiver ativo. Por favor, reserve mais tempo para a sua viagem e entre em contacto connosco para atualizações. Agradecemos a sua paciência enquanto gerimos a situação.' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: 'Due to a road accident, service at the stop {stop_name} is experiencing significant delays while this notice is in effect. Please allow extra travel time and contact our customer service for updates. We appreciate your patience as we manage the situation.' },
				pt: { placeholders: ['{stop_name}'], text: 'Devido a um acidente rodoviário, o serviço na paragem {stop_name} está a sofrer atrasos significativos enquanto este aviso estiver ativo. Por favor, reserve mais tempo para a sua viagem e entre em contacto connosco para atualizações. Agradecemos a sua paciência enquanto gerimos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Significant delays due to road accident' },
				pt: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Atrasos significativos devido a acidente rodoviário' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: '{stop_name} | Significant delays due to road accident' },
				pt: { placeholders: ['{stop_name}'], text: '{stop_name} | Atrasos significativos devido a acidente rodoviário' },
			},
		},
	},

	'CONSTRUCTION:ACCESSIBILITY_ISSUE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'CONSTRUCTION:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to construction work, accessibility on the lines {line_short_name[]} is temporarily affected. Please follow updated information or contact our customer service for assistance. We appreciate your understanding while we complete the necessary works.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a obras de construção, a acessibilidade nas linhas {line_short_name[]} está temporariamente afetada. Por favor, consulte as informações atualizadas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto concluímos as obras necessárias.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to construction work, accessibility on the line {line_short_name} is temporarily affected. Please follow updated information or contact our customer service for assistance. We appreciate your understanding while we complete the necessary works.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a obras de construção, a acessibilidade na linha {line_short_name} está temporariamente afetada. Por favor, consulte as informações atualizadas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto concluímos as obras necessárias.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Accessibility affected due to construction' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acessibilidade afetada devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Accessibility affected due to construction' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acessibilidade afetada devido a obras de construção' },
			},
		},
	},

	'CONSTRUCTION:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: 'Due to construction work, accessibility on the rides {ride_short_name[]} is temporarily affected. Please follow updated information or contact our customer service for assistance. We appreciate your understanding while the works are completed.' },
				pt: { placeholders: ['{ride_short_name[]}'], text: 'Devido a obras de construção, a acessibilidade nas viagens {ride_short_name[]} está temporariamente afetada. Por favor, consulte as informações atualizadas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto as obras são concluídas.' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: 'Due to construction work, accessibility on the ride {ride_short_name} is temporarily affected. Please follow updated information or contact our customer service for assistance. We appreciate your understanding while the works are completed.' },
				pt: { placeholders: ['{ride_short_name}'], text: 'Devido a obras de construção, a acessibilidade na viagem {ride_short_name} está temporariamente afetada. Por favor, consulte as informações atualizadas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto as obras são concluídas.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Accessibility affected due to construction' },
				pt: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Acessibilidade afetada devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Accessibility affected due to construction' },
				pt: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Acessibilidade afetada devido a obras de construção' },
			},
		},
	},

	'CONSTRUCTION:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: 'Due to construction work, accessibility at the stops {stop_name[]} is temporarily affected. Please follow posted signage or contact our customer service for assistance. We appreciate your understanding while the works are completed.' },
				pt: { placeholders: ['{stop_name[]}'], text: 'Devido a obras de construção, a acessibilidade nas paragens {stop_name[]} está temporariamente afetada. Por favor, siga a sinalização ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto as obras são concluídas.' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: 'Due to construction work, accessibility at the stop {stop_name} is temporarily affected. Please follow posted signage or contact our customer service for assistance. We appreciate your understanding while the works are completed.' },
				pt: { placeholders: ['{stop_name}'], text: 'Devido a obras de construção, a acessibilidade na paragem {stop_name} está temporariamente afetada. Por favor, siga a sinalização ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto as obras são concluídas.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Accessibility affected due to construction' },
				pt: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Acessibilidade afetada devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: '{stop_name} | Accessibility affected due to construction' },
				pt: { placeholders: ['{stop_name}'], text: '{stop_name} | Acessibilidade afetada devido a obras de construção' },
			},
		},
	},

	'CONSTRUCTION:DETOUR:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'CONSTRUCTION:DETOUR:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to construction work, the lines {line_short_name[]} are operating on a detour while this notice is in effect. Please check updated schedules or contact our customer service for further information. We appreciate your understanding while we complete the works.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a obras de construção, as linhas {line_short_name[]} estão a operar em desvio enquanto este aviso estiver ativo. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto concluímos as obras.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to construction work, the line {line_short_name} is operating on a detour while this notice is in effect. Please check updated schedules or contact our customer service for further information. We appreciate your understanding while we complete the works.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a obras de construção, a linha {line_short_name} está a operar em desvio enquanto este aviso estiver ativo. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto concluímos as obras.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Service operating on detour due to construction' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Serviço em desvio devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Service operating on detour due to construction' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Serviço em desvio devido a obras de construção' },
			},
		},
	},

	'CONSTRUCTION:DETOUR:rides': {
		description: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: 'Due to construction work, the rides {ride_short_name[]} are operating on a detour while this notice is in effect. Please check updated schedules or contact our customer service for further information. We appreciate your understanding while we complete the works.' },
				pt: { placeholders: ['{ride_short_name[]}'], text: 'Devido a obras de construção, as viagens {ride_short_name[]} estão a operar em desvio enquanto este aviso estiver ativo. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto concluímos as obras.' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: 'Due to construction work, the ride {ride_short_name} is operating on a detour while this notice is in effect. Please check updated schedules or contact our customer service for further information. We appreciate your understanding while we complete the works.' },
				pt: { placeholders: ['{ride_short_name}'], text: 'Devido a obras de construção, a viagem {ride_short_name} está a operar em desvio enquanto este aviso estiver ativo. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto concluímos as obras.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Service operating on detour due to construction' },
				pt: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Serviço em desvio devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Service operating on detour due to construction' },
				pt: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Serviço em desvio devido a obras de construção' },
			},
		},
	},

	'CONSTRUCTION:DETOUR:stops': {
		description: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: 'Due to construction work, the stops {stop_name[]} are temporarily served via a detour. Please follow posted signage or contact our customer service for updated information. We appreciate your understanding while the works are completed.' },
				pt: { placeholders: ['{stop_name[]}'], text: 'Devido a obras de construção, as paragens {stop_name[]} estão temporariamente a ser servidas por um desvio. Por favor, siga a sinalização ou entre em contacto connosco para informações atualizadas. Agradecemos a sua compreensão enquanto as obras são concluídas.' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: 'Due to construction work, the stop {stop_name} is temporarily served via a detour. Please follow posted signage or contact our customer service for updated information. We appreciate your understanding while the works are completed.' },
				pt: { placeholders: ['{stop_name}'], text: 'Devido a obras de construção, a paragem {stop_name} está temporariamente a ser servida por um desvio. Por favor, siga a sinalização ou entre em contacto connosco para informações atualizadas. Agradecemos a sua compreensão enquanto as obras são concluídas.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Stops temporarily detoured due to construction' },
				pt: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Paragens temporariamente desviadas devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: '{stop_name} | Stop temporarily detoured due to construction' },
				pt: { placeholders: ['{stop_name}'], text: '{stop_name} | Paragem temporariamente desviada devido a obras de construção' },
			},
		},
	},

	'CONSTRUCTION:NO_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'CONSTRUCTION:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to construction work, service on the lines {line_short_name[]} has been canceled while this notice is in effect. Please use alternative routes or contact our customer service for more information. We thank you for your understanding while the works are completed.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a obras de construção, o serviço nas linhas {line_short_name[]} foi cancelado enquanto este aviso estiver ativo. Por favor, utilize rotas alternativas ou entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto as obras são concluídas.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to construction work, service on the line {line_short_name} has been canceled while this notice is in effect. Please use alternative routes or contact our customer service for more information. We thank you for your understanding while the works are completed.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a obras de construção, o serviço na linha {line_short_name} foi cancelado enquanto este aviso estiver ativo. Por favor, utilize rotas alternativas ou entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto as obras são concluídas.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Service canceled due to construction' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Serviço cancelado devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Service canceled due to construction' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Serviço cancelado devido a obras de construção' },
			},
		},
	},

	'CONSTRUCTION:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: 'Due to construction work, the rides {ride_short_name[]} have been canceled while this notice is in effect. Please use alternative routes or contact our customer service for more information. We thank you for your understanding while the works are completed.' },
				pt: { placeholders: ['{ride_short_name[]}'], text: 'Devido a obras de construção, as viagens {ride_short_name[]} foram canceladas enquanto este aviso estiver ativo. Por favor, utilize rotas alternativas ou entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto as obras são concluídas.' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: 'Due to construction work, the ride {ride_short_name} has been canceled while this notice is in effect. Please use alternative routes or contact our customer service for more information. We thank you for your understanding while the works are completed.' },
				pt: { placeholders: ['{ride_short_name}'], text: 'Devido a obras de construção, a viagem {ride_short_name} foi cancelada enquanto este aviso estiver ativo. Por favor, utilize rotas alternativas ou entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto as obras são concluídas.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Rides canceled due to construction' },
				pt: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Viagens canceladas devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Ride canceled due to construction' },
				pt: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Viagem cancelada devido a obras de construção' },
			},
		},
	},

	'CONSTRUCTION:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: 'Due to construction work, the stops {stop_name[]} are temporarily not served. Please use alternative routes or contact our customer service for more information. We appreciate your understanding while the works are completed.' },
				pt: { placeholders: ['{stop_name[]}'], text: 'Devido a obras de construção, as paragens {stop_name[]} não estão a ser servidas temporariamente. Por favor, utilize rotas alternativas ou entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto as obras são concluídas.' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: 'Due to construction work, the stop {stop_name} is temporarily not served. Please use alternative routes or contact our customer service for more information. We appreciate your understanding while the works are completed.' },
				pt: { placeholders: ['{stop_name}'], text: 'Devido a obras de construção, a paragem {stop_name} não está a ser servida temporariamente. Por favor, utilize rotas alternativas ou entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto as obras são concluídas.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Stops not served due to construction' },
				pt: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Paragens não servidas devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: '{stop_name} | Stop not served due to construction' },
				pt: { placeholders: ['{stop_name}'], text: '{stop_name} | Paragem não servida devido a obras de construção' },
			},
		},
	},

	'CONSTRUCTION:REDUCED_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'CONSTRUCTION:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to construction work, the lines {line_short_name[]} are operating with reduced service. Please check updated schedules or contact our customer service for details. We appreciate your understanding.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a obras de construção, as linhas {line_short_name[]} estão a operar com serviço reduzido. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to construction work, the line {line_short_name} is operating with reduced service. Please check updated schedules or contact our customer service for details. We appreciate your understanding.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a obras de construção, a linha {line_short_name} está a operar com serviço reduzido. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Reduced service due to construction' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Serviço reduzido devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Reduced service due to construction' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Serviço reduzido devido a obras de construção' },
			},
		},
	},

	'CONSTRUCTION:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: 'Due to construction work, the rides {ride_short_name[]} are operating with reduced service. Please check updated schedules or contact our customer service for details. We appreciate your understanding.' },
				pt: { placeholders: ['{ride_short_name[]}'], text: 'Devido a obras de construção, as viagens {ride_short_name[]} estão a operar com serviço reduzido. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão.' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: 'Due to construction work, the ride {ride_short_name} is operating with reduced service. Please check updated schedules or contact our customer service for details. We appreciate your understanding.' },
				pt: { placeholders: ['{ride_short_name}'], text: 'Devido a obras de construção, a viagem {ride_short_name} está a operar com serviço reduzido. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Reduced service due to construction' },
				pt: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Serviço reduzido devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Reduced service due to construction' },
				pt: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Serviço reduzido devido a obras de construção' },
			},
		},
	},

	'CONSTRUCTION:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: 'Due to construction work, the stops {stop_name[]} are served with reduced frequency. Please check updated schedules or contact our customer service for details. We appreciate your understanding.' },
				pt: { placeholders: ['{stop_name[]}'], text: 'Devido a obras de construção, as paragens {stop_name[]} estão a ser servidas com frequência reduzida. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão.' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: 'Due to construction work, the stop {stop_name} is served with reduced frequency. Please check updated schedules or contact our customer service for details. We appreciate your understanding.' },
				pt: { placeholders: ['{stop_name}'], text: 'Devido a obras de construção, a paragem {stop_name} está a ser servida com frequência reduzida. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Reduced service due to construction' },
				pt: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Serviço reduzido devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: '{stop_name} | Reduced service due to construction' },
				pt: { placeholders: ['{stop_name}'], text: '{stop_name} | Serviço reduzido devido a obras de construção' },
			},
		},
	},

	'CONSTRUCTION:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'CONSTRUCTION:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to construction work, the lines {line_short_name[]} are experiencing significant delays. We apologize for the inconvenience.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a obras de construção, as linhas {line_short_name[]} estão a enfrentar atrasos significativos. Pedimos desculpas pelo inconveniente.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to construction work, the line {line_short_name} is experiencing significant delays. We apologize for the inconvenience.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a obras de construção, a linha {line_short_name} está a enfrentar atrasos significativos. Pedimos desculpas pelo inconveniente.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Significant delays due to construction' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Atrasos significativos devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Significant delays due to construction' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Atrasos significativos devido a obras de construção' },
			},
		},
	},

	'CONSTRUCTION:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { placeholders: ['{rides_description}'], text: 'Due to construction works, the trips {rides_description} are experiencing significant delays. We apologize for the inconvenience.' },
				pt: { placeholders: ['{rides_description}'], text: 'Devido a obras, as viagens {rides_description} estão enfrentando atrasos significativos. Pedimos desculpas pelo inconveniente.' },
			},
			singular: {
				en: { placeholders: ['{ride_description}'], text: 'Due to construction work, the trip {ride_description} is experiencing significant delays. We apologize for the inconvenience.' },
				pt: { placeholders: ['{ride_description}'], text: 'Devido a obras, a viagem {ride_description} está enfrentando atrasos significativos. Pedimos desculpas pelo inconveniente.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{rides_description}'], text: '{rides_description} | Significant delays due to construction' },
				pt: { placeholders: ['{rides_description}'], text: '{rides_description} | Atrasos significativos devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{ride_description}'], text: '{ride_description} | Significant delays due to construction' },
				pt: { placeholders: ['{ride_description}'], text: '{ride_description} | Atrasos significativos devido a obras de construção' },
			},
		},
	},

	'CONSTRUCTION:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: 'Due to construction work, the stops {stop_name[]} are experiencing significant delays. We apologize for the inconvenience.' },
				pt: { placeholders: ['{stop_name[]}'], text: 'Devido a obras de construção, as paragens {stop_name[]} estão a enfrentar atrasos significativos. Pedimos desculpas pelo inconveniente.' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: 'Due to construction work, the stop {stop_name} is experiencing significant delays. We apologize for the inconvenience.' },
				pt: { placeholders: ['{stop_name}'], text: 'Devido a obras de construção, a paragem {stop_name} está a enfrentar atrasos significativos. Pedimos desculpas pelo inconveniente.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Significant delays due to construction' },
				pt: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Atrasos significativos devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: '{stop_name} | Significant delays due to construction' },
				pt: { placeholders: ['{stop_name}'], text: '{stop_name} | Atrasos significativos devido a obras de construção' },
			},
		},
	},

	'CONSTRUCTION:STOP_MOVED:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'CONSTRUCTION:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to construction work, the stops for lines {line_short_name[]} have been temporarily moved. Please check updated route information or contact our customer service for assistance.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a obras de construção, as paragens das linhas {line_short_name[]} foram temporariamente deslocadas. Por favor, consulte informações atualizadas ou entre em contacto connosco para assistência.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to construction work, the stop for line {line_short_name} has been temporarily moved. Please check updated route information or contact our customer service for assistance.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a obras de construção, a paragem da linha {line_short_name} foi temporariamente deslocada. Por favor, consulte informações atualizadas ou entre em contacto connosco para assistência.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Stops temporarily moved due to construction' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Paragens temporariamente deslocadas devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Stop temporarily moved due to construction' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Paragem temporariamente deslocada devido a obras de construção' },
			},
		},
	},

	'CONSTRUCTION:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: 'Due to construction work, the stops for the rides {ride_short_name[]} have been temporarily moved. Please check updated route information or contact our customer service for assistance.' },
				pt: { placeholders: ['{ride_short_name[]}'], text: 'Devido a obras de construção, as paragens das viagens {ride_short_name[]} foram temporariamente deslocadas. Por favor, consulte informações atualizadas ou entre em contacto connosco para assistência.' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: 'Due to construction work, the stop for the ride {ride_short_name} has been temporarily moved. Please check updated route information or contact our customer service for assistance.' },
				pt: { placeholders: ['{ride_short_name}'], text: 'Devido a obras de construção, a paragem da viagem {ride_short_name} foi temporariamente deslocada. Por favor, consulte informações atualizadas ou entre em contacto connosco para assistência.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Stops temporarily moved due to construction' },
				pt: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Paragens temporariamente deslocadas devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Stop temporarily moved due to construction' },
				pt: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Paragem temporariamente deslocada devido a obras de construção' },
			},
		},
	},

	'CONSTRUCTION:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: 'Due to construction work, the stops {stop_name[]} have been temporarily relocated. Please use updated route information or contact our customer service for assistance.' },
				pt: { placeholders: ['{stop_name[]}'], text: 'Devido a obras de construção, as paragens {stop_name[]} foram temporariamente relocadas. Por favor, utilize informações de rota atualizadas ou entre em contacto connosco para assistência.' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: 'Due to construction work, the stop {stop_name} has been temporarily relocated. Please use updated route information or contact our customer service for assistance.' },
				pt: { placeholders: ['{stop_name}'], text: 'Devido a obras de construção, a paragem {stop_name} foi temporariamente relocada. Por favor, utilize informações de rota atualizadas ou entre em contacto connosco para assistência.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Stops temporarily relocated due to construction' },
				pt: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Paragens temporariamente relocadas devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: '{stop_name} | Stop temporarily relocated due to construction' },
				pt: { placeholders: ['{stop_name}'], text: '{stop_name} | Paragem temporariamente relocada devido a obras de construção' },
			},
		},
	},

	'DEMONSTRATION:ACCESSIBILITY_ISSUE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'DEMONSTRATION:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to demonstration activities, accessibility on lines {line_short_name[]} may be affected. Please plan your route accordingly or contact customer service for more information.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a atividades de manifestação, a acessibilidade nas linhas {line_short_name[]} pode ser afetada. Por favor, planeie a sua rota ou entre em contacto connosco para mais informações.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to demonstration activities, accessibility on the line {line_short_name} may be affected. Please plan your route accordingly or contact customer service for more information.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a atividades de manifestação, a acessibilidade na linha {line_short_name} pode ser afetada. Por favor, planeie a sua rota ou entre em contacto connosco para mais informações.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Accessibility affected due to demonstration' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acessibilidade afetada devido a manifestação' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Accessibility affected due to demonstration' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acessibilidade afetada devido a manifestação' },
			},
		},
	},

	'DEMONSTRATION:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: 'Due to demonstration activities, accessibility on the rides {ride_short_name[]} may be affected. Please plan your route accordingly or contact customer service for more information.' },
				pt: { placeholders: ['{ride_short_name[]}'], text: 'Devido a atividades de manifestação, a acessibilidade nas viagens {ride_short_name[]} pode ser afetada. Por favor, planeie a sua rota ou entre em contacto connosco para mais informações.' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: 'Due to demonstration activities, accessibility on the ride {ride_short_name} may be affected. Please plan your route accordingly or contact customer service for more information.' },
				pt: { placeholders: ['{ride_short_name}'], text: 'Devido a atividades de manifestação, a acessibilidade na viagem {ride_short_name} pode ser afetada. Por favor, planeie a sua rota ou entre em contacto connosco para mais informações.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Accessibility affected due to demonstration' },
				pt: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Acessibilidade afetada devido a manifestação' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Accessibility affected due to demonstration' },
				pt: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Acessibilidade afetada devido a manifestação' },
			},
		},
	},

	'DEMONSTRATION:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: 'Access at the stops {stop_name[]} is currently limited due to a demonstration. Please plan your journey accordingly or contact our customer service for alternative options. We appreciate your patience while we ensure safe access.' },
				pt: { placeholders: ['{stop_name[]}'], text: 'O acesso às paragens {stop_name[]} encontra-se temporariamente limitado devido a uma manifestação. Por favor, planeie a sua viagem em conformidade ou entre em contacto connosco para opções alternativas. Agradecemos a sua paciência enquanto garantimos a segurança do acesso.' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: 'Access at the stop {stop_name} is currently limited due to a demonstration. Please plan your journey accordingly or contact our customer service for alternative options. We appreciate your patience while we ensure safe access.' },
				pt: { placeholders: ['{stop_name}'], text: 'O acesso à paragem {stop_name} encontra-se temporariamente limitado devido a uma manifestação. Por favor, planeie a sua viagem em conformidade ou entre em contacto connosco para opções alternativas. Agradecemos a sua paciência enquanto garantimos a segurança do acesso.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Demonstration affects stop accessibility' },
				pt: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Manifestação afeta a acessibilidade das paragens' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: '{stop_name} | Demonstration affects stop accessibility' },
				pt: { placeholders: ['{stop_name}'], text: '{stop_name} | Manifestação afeta a acessibilidade da paragem' },
			},
		},
	},

	'DEMONSTRATION:ADDITIONAL_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'DEMONSTRATION:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Additional service is being provided on lines {line_short_name[]} due to a demonstration affecting normal operations. Please check schedules and plan your journey accordingly. Thank you for your understanding.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Serviço adicional está a ser fornecido nas linhas {line_short_name[]} devido a uma manifestação que afeta as operações normais. Por favor, verifique os horários e planeie a sua viagem em conformidade. Agradecemos a sua compreensão.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Additional service is being provided on line {line_short_name} due to a demonstration affecting normal operations. Please check schedules and plan your journey accordingly. Thank you for your understanding.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Serviço adicional está a ser fornecido na linha {line_short_name} devido a uma manifestação que afeta as operações normais. Por favor, verifique os horários e planeie a sua viagem em conformidade. Agradecemos a sua compreensão.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Demonstration prompts additional service' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Manifestação leva a serviço adicional' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Demonstration prompts additional service' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Manifestação leva a serviço adicional' },
			},
		},
	},

	'DEMONSTRATION:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Additional rides have been scheduled to accommodate increased demand due to the demonstration. Please check schedules for updated service times.' },
				pt: { placeholders: [], text: 'Viagens adicionais foram programadas para atender à maior procura devido à manifestação. Por favor, consulte os horários para informações atualizadas.' },
			},
			singular: {
				en: { placeholders: [], text: 'An additional ride has been scheduled to accommodate increased demand due to the demonstration. Please check schedules for updated service times.' },
				pt: { placeholders: [], text: 'Uma viagem adicional foi programada para atender à maior procura devido à manifestação. Por favor, consulte os horários para informações atualizadas.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Additional rides scheduled due to demonstration' },
				pt: { placeholders: [], text: 'Viagens adicionais programadas devido à manifestação' },
			},
			singular: {
				en: { placeholders: [], text: 'Additional ride scheduled due to demonstration' },
				pt: { placeholders: [], text: 'Viagem adicional programada devido à manifestação' },
			},
		},
	},

	'DEMONSTRATION:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Extra stops have been added along the route to better serve passengers during the demonstration. Check local signage or announcements for details.' },
				pt: { placeholders: [], text: 'Paragens adicionais foram incluídas ao longo do percurso para melhor atender os passageiros durante a manifestação. Verifique a sinalização local ou anúncios para mais detalhes.' },
			},
			singular: {
				en: { placeholders: [], text: 'An extra stop has been added along the route to better serve passengers during the demonstration. Check local signage or announcements for details.' },
				pt: { placeholders: [], text: 'Uma paragem adicional foi incluída ao longo do percurso para melhor atender os passageiros durante a manifestação. Verifique a sinalização local ou anúncios para mais detalhes.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Additional stops added due to demonstration' },
				pt: { placeholders: [], text: 'Paragens adicionais incluídas devido à manifestação' },
			},
			singular: {
				en: { placeholders: [], text: 'Additional stop added due to demonstration' },
				pt: { placeholders: [], text: 'Paragem adicional incluída devido à manifestação' },
			},
		},
	},

	'DEMONSTRATION:DETOUR:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'DEMONSTRATION:DETOUR:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a demonstration, the lines {line_short_name[]} are following a temporary detour. Please follow posted signs and allow extra travel time.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a uma manifestação, as linhas {line_short_name[]} estão a seguir um desvio temporário. Por favor, siga a sinalização e permita tempo extra de viagem.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a demonstration, the line {line_short_name} is following a temporary detour. Please follow posted signs and allow extra travel time.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a uma manifestação, a linha {line_short_name} está a seguir um desvio temporário. Por favor, siga a sinalização e permita tempo extra de viagem.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Temporary detour due to demonstration' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Desvio temporário devido à manifestação' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Temporary detour due to demonstration' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Desvio temporário devido à manifestação' },
			},
		},
	},

	'DEMONSTRATION:DETOUR:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Due to ongoing demonstrations, the affected rides are being detoured along alternative routes. Please follow the posted signs and plan for possible delays.' },
				pt: { placeholders: [], text: 'Devido a manifestações em curso, os percursos afetados estão a ser desviados por rotas alternativas. Por favor, siga a sinalização e antecipe possíveis atrasos.' },
			},
			singular: {
				en: { placeholders: [], text: 'Due to an ongoing demonstration, this ride is being detoured along an alternative route. Please follow the posted signs and expect possible delays.' },
				pt: { placeholders: [], text: 'Devido a uma manifestação em curso, este percurso está a ser desviado por uma rota alternativa. Por favor, siga a sinalização e antecipe possíveis atrasos.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Rides Detoured Due to Demonstrations' },
				pt: { placeholders: [], text: 'Percursos Desviados Devido a Manifestações' },
			},
			singular: {
				en: { placeholders: [], text: 'Ride Detoured Due to Demonstration' },
				pt: { placeholders: [], text: 'Percurso Desviado Devido a Manifestação' },
			},
		},
	},

	'DEMONSTRATION:DETOUR:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Several stops are currently bypassed due to demonstrations. Please use nearby alternative stops or consult customer service for guidance.' },
				pt: { placeholders: [], text: 'Vários pontos de paragem estão temporariamente contornados devido a manifestações. Utilize paragens alternativas próximas ou contacte o serviço de atendimento ao cliente.' },
			},
			singular: {
				en: { placeholders: [], text: 'This stop is temporarily bypassed due to a demonstration. Please use a nearby alternative stop or consult customer service.' },
				pt: { placeholders: [], text: 'Este ponto de paragem está temporariamente contornado devido a uma manifestação. Utilize uma paragem alternativa próxima ou contacte o serviço de atendimento ao cliente.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Stops Temporarily Bypassed Due to Demonstrations' },
				pt: { placeholders: [], text: 'Paragens Temporariamente Contornadas Devido a Manifestações' },
			},
			singular: {
				en: { placeholders: [], text: 'Stop Temporarily Bypassed Due to Demonstration' },
				pt: { placeholders: [], text: 'Paragem Temporariamente Contornada Devido a Manifestação' },
			},
		},
	},

	'DEMONSTRATION:MODIFIED_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'DEMONSTRATION:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Service on the following lines has been modified due to demonstrations. Schedules and routes may be adjusted; please check current information before traveling.' },
				pt: { placeholders: [], text: 'O serviço nas seguintes linhas foi modificado devido a manifestações. Os horários e percursos podem ter alterações; consulte as informações atualizadas antes de viajar.' },
			},
			singular: {
				en: { placeholders: [], text: 'Service on this line has been modified due to a demonstration. Schedules and routes may be adjusted; please check current information before traveling.' },
				pt: { placeholders: [], text: 'O serviço nesta linha foi modificado devido a uma manifestação. Os horários e percursos podem ter alterações; consulte as informações atualizadas antes de viajar.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Lines with Modified Service Due to Demonstrations' },
				pt: { placeholders: [], text: 'Linhas com Serviço Modificado Devido a Manifestações' },
			},
			singular: {
				en: { placeholders: [], text: 'Line with Modified Service Due to Demonstration' },
				pt: { placeholders: [], text: 'Linha com Serviço Modificado Devido a Manifestação' },
			},
		},
	},

	'DEMONSTRATION:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Certain rides are operating on modified routes or schedules due to demonstrations. Expect changes and plan accordingly.' },
				pt: { placeholders: [], text: 'Alguns percursos estão a operar com rotas ou horários modificados devido a manifestações. Antecipe alterações e planeie em conformidade.' },
			},
			singular: {
				en: { placeholders: [], text: 'This ride is operating on a modified route or schedule due to a demonstration. Expect changes and plan accordingly.' },
				pt: { placeholders: [], text: 'Este percurso está a operar com rota ou horário modificado devido a uma manifestação. Antecipe alterações e planeie em conformidade.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Rides with Modified Service Due to Demonstrations' },
				pt: { placeholders: [], text: 'Percursos com Serviço Modificado Devido a Manifestações' },
			},
			singular: {
				en: { placeholders: [], text: 'Ride with Modified Service Due to Demonstration' },
				pt: { placeholders: [], text: 'Percurso com Serviço Modificado Devido a Manifestação' },
			},
		},
	},

	'DEMONSTRATION:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Multiple stops may have altered service due to demonstrations. Check for temporary closures or schedule changes before traveling.' },
				pt: { placeholders: [], text: 'Vários pontos de paragem podem ter serviço alterado devido a manifestações. Verifique encerramentos temporários ou alterações de horário antes de viajar.' },
			},
			singular: {
				en: { placeholders: [], text: 'This stop may have altered service due to a demonstration. Check for temporary closures or schedule changes before traveling.' },
				pt: { placeholders: [], text: 'Este ponto de paragem pode ter serviço alterado devido a uma manifestação. Verifique encerramentos temporários ou alterações de horário antes de viajar.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Stops with Modified Service Due to Demonstrations' },
				pt: { placeholders: [], text: 'Paragens com Serviço Modificado Devido a Manifestações' },
			},
			singular: {
				en: { placeholders: [], text: 'Stop with Modified Service Due to Demonstration' },
				pt: { placeholders: [], text: 'Paragem com Serviço Modificado Devido a Manifestação' },
			},
		},
	},

	'DEMONSTRATION:NO_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'DEMONSTRATION:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a demonstration, service on the lines {line_short_name[]} has been suspended while this notice is in effect. Please use alternative routes or contact our customer service for more information.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a uma manifestação, o serviço nas linhas {line_short_name[]} foi suspenso enquanto este aviso estiver ativo. Por favor, utilize rotas alternativas ou entre em contato connosco para mais informações.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a demonstration, service on the line {line_short_name} has been suspended while this notice is in effect. Please use alternative routes or contact our customer service for more information.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a uma manifestação, o serviço na linha {line_short_name} foi suspenso enquanto este aviso estiver ativo. Por favor, utilize rotas alternativas ou entre em contato connosco para mais informações.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Demonstration causes temporary service suspension' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Manifestação provoca suspensão temporária do serviço' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Demonstration causes temporary service suspension' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Manifestação provoca suspensão temporária do serviço' },
			},
		},
	},

	'DEMONSTRATION:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: 'Service on the rides {ride_short_name[]} is currently unavailable due to a demonstration. We apologize for the inconvenience and advise using alternative options.' },
				pt: { placeholders: ['{ride_short_name[]}'], text: 'O serviço nas viagens {ride_short_name[]} não está disponível devido a uma manifestação. Pedimos desculpa pelo transtorno e sugerimos utilizar alternativas.' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: 'Service on the ride {ride_short_name} is currently unavailable due to a demonstration. We apologize for the inconvenience and advise using alternative options.' },
				pt: { placeholders: ['{ride_short_name}'], text: 'O serviço na viagem {ride_short_name} não está disponível devido a uma manifestação. Pedimos desculpa pelo transtorno e sugerimos utilizar alternativas.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Demonstration causes ride service suspension' },
				pt: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Manifestação provoca suspensão do serviço de viagem' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Demonstration causes ride service suspension' },
				pt: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Manifestação provoca suspensão do serviço de viagem' },
			},
		},
	},

	'DEMONSTRATION:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: 'Access to the stops {stop_name[]} is currently blocked due to a demonstration. Please use nearby stops or alternative routes.' },
				pt: { placeholders: ['{stop_name[]}'], text: 'O acesso às paragens {stop_name[]} está bloqueado devido a uma manifestação. Por favor, utilize paragens próximas ou rotas alternativas.' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: 'Access to the stop {stop_name} is currently blocked due to a demonstration. Please use nearby stops or alternative routes.' },
				pt: { placeholders: ['{stop_name}'], text: 'O acesso à paragem {stop_name} está bloqueado devido a uma manifestação. Por favor, utilize paragens próximas ou rotas alternativas.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Stops blocked due to demonstration' },
				pt: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Paragens bloqueadas devido a manifestação' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: '{stop_name} | Stop blocked due to demonstration' },
				pt: { placeholders: ['{stop_name}'], text: '{stop_name} | Paragem bloqueada devido a manifestação' },
			},
		},
	},

	'DEMONSTRATION:REDUCED_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'DEMONSTRATION:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Service on the lines {line_short_name[]} is operating with reduced frequency due to a demonstration. Please allow extra travel time.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'O serviço nas linhas {line_short_name[]} está a funcionar com frequência reduzida devido a uma manifestação. Por favor, preveja mais tempo para a viagem.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Service on the line {line_short_name} is operating with reduced frequency due to a demonstration. Please allow extra travel time.' },
				pt: { placeholders: ['{line_short_name}'], text: 'O serviço na linha {line_short_name} está a funcionar com frequência reduzida devido a uma manifestação. Por favor, preveja mais tempo para a viagem.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Reduced service due to demonstration' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Serviço reduzido devido a manifestação' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Reduced service due to demonstration' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Serviço reduzido devido a manifestação' },
			},
		},
	},

	'DEMONSTRATION:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: 'Rides {ride_short_name[]} are operating with reduced frequency due to a demonstration. Please plan accordingly.' },
				pt: { placeholders: ['{ride_short_name[]}'], text: 'As viagens {ride_short_name[]} estão a funcionar com frequência reduzida devido a uma manifestação. Por favor, planeie em conformidade.' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: 'Ride {ride_short_name} is operating with reduced frequency due to a demonstration. Please plan accordingly.' },
				pt: { placeholders: ['{ride_short_name}'], text: 'A viagem {ride_short_name} está a funcionar com frequência reduzida devido a uma manifestação. Por favor, planeie em conformidade.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Reduced ride service due to demonstration' },
				pt: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Serviço de viagem reduzido devido a manifestação' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Reduced ride service due to demonstration' },
				pt: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Serviço de viagem reduzido devido a manifestação' },
			},
		},
	},

	'DEMONSTRATION:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: 'Service at the stops {stop_name[]} is limited due to a demonstration. Consider alternative stops or routes.' },
				pt: { placeholders: ['{stop_name[]}'], text: 'O serviço nas paragens {stop_name[]} está limitado devido a uma manifestação. Considere paragens ou rotas alternativas.' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: 'Service at the stop {stop_name} is limited due to a demonstration. Consider alternative stops or routes.' },
				pt: { placeholders: ['{stop_name}'], text: 'O serviço na paragem {stop_name} está limitado devido a uma manifestação. Considere paragens ou rotas alternativas.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Stops operating with reduced service due to demonstration' },
				pt: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Paragens com serviço reduzido devido a manifestação' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: '{stop_name} | Stop operating with reduced service due to demonstration' },
				pt: { placeholders: ['{stop_name}'], text: '{stop_name} | Paragem com serviço reduzido devido a manifestação' },
			},
		},
	},

	'DEMONSTRATION:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'DEMONSTRATION:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Lines {line_short_name[]} are experiencing significant delays due to a demonstration. Expect longer travel times and consider alternative routes.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'As linhas {line_short_name[]} estão a sofrer atrasos significativos devido a uma manifestação. Espere tempos de viagem mais longos e considere rotas alternativas.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Line {line_short_name} is experiencing significant delays due to a demonstration. Expect longer travel times and consider alternative routes.' },
				pt: { placeholders: ['{line_short_name}'], text: 'A linha {line_short_name} está a sofrer atrasos significativos devido a uma manifestação. Espere tempos de viagem mais longos e considere rotas alternativas.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Significant delays due to demonstration' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Atrasos significativos devido a manifestação' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Significant delays due to demonstration' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Atrasos significativos devido a manifestação' },
			},
		},
	},

	'DEMONSTRATION:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Ongoing demonstrations are causing significant delays across multiple rides. Please allow extra travel time and consider alternative routes where possible.' },
				pt: { placeholders: [], text: 'As manifestações em curso estão a causar atrasos significativos em várias viagens. Por favor, planeie tempo adicional de deslocação e considere rotas alternativas sempre que possível.' },
			},
			singular: {
				en: { placeholders: [], text: 'Ongoing demonstrations are causing significant delays on this ride. Please allow extra travel time and consider alternative routes where possible.' },
				pt: { placeholders: [], text: 'As manifestações em curso estão a causar atrasos significativos nesta viagem. Por favor, planeie tempo adicional de deslocação e considere rotas alternativas sempre que possível.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Multiple Rides | Demonstrations causing significant delays' },
				pt: { placeholders: [], text: 'Várias Viagens | Manifestações provocam atrasos significativos' },
			},
			singular: {
				en: { placeholders: [], text: 'Ride | Demonstration causing significant delays' },
				pt: { placeholders: [], text: 'Viagem | Manifestação provoca atraso significativo' },
			},
		},
	},

	'DEMONSTRATION:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Demonstrations in the area are causing delays at multiple stops. Passengers are advised to check schedules and consider alternative stops or routes.' },
				pt: { placeholders: [], text: 'As manifestações na área estão a causar atrasos em várias paragens. Recomenda-se que os passageiros verifiquem os horários e considerem paragens ou rotas alternativas.' },
			},
			singular: {
				en: { placeholders: [], text: 'Demonstrations in the area are causing delays at this stop. Passengers are advised to check schedules and consider alternative stops or routes.' },
				pt: { placeholders: [], text: 'As manifestações na área estão a causar atrasos nesta paragem. Recomenda-se que os passageiros verifiquem os horários e considerem paragens ou rotas alternativas.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Multiple Stops | Demonstrations causing delays' },
				pt: { placeholders: [], text: 'Várias Paragens | Manifestações provocam atrasos' },
			},
			singular: {
				en: { placeholders: [], text: 'Stop | Demonstration causing delays' },
				pt: { placeholders: [], text: 'Paragem | Manifestação provoca atraso' },
			},
		},
	},

	'DRIVER_ABSENCE:NO_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'DRIVER_ABSENCE:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to driver absence, service on the lines {line_short_name[]} has been canceled while this notice is in effect. Please use alternative routes or contact customer service for assistance.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido à ausência de condutores, o serviço nas linhas {line_short_name[]} foi cancelado enquanto este aviso estiver ativo. Por favor, utilize rotas alternativas ou contacte o serviço de atendimento ao cliente para assistência.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to driver absence, service on the line {line_short_name} has been canceled while this notice is in effect. Please use alternative routes or contact customer service for assistance.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido à ausência de condutor, o serviço na linha {line_short_name} foi cancelado enquanto este aviso estiver ativo. Por favor, utilize rotas alternativas ou contacte o serviço de atendimento ao cliente para assistência.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Service canceled due to driver absence' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Serviço cancelado devido à ausência de condutores' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Service canceled due to driver absence' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Serviço cancelado devido à ausência de condutor' },
			},
		},
	},

	'DRIVER_ABSENCE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Some rides have been canceled due to driver absence. Please check alternative options or contact customer service.' },
				pt: { placeholders: [], text: 'Algumas viagens foram canceladas devido à ausência de condutores. Por favor, verifique opções alternativas ou contacte o serviço de atendimento ao cliente.' },
			},
			singular: {
				en: { placeholders: [], text: 'This ride has been canceled due to driver absence. Please check alternative options or contact customer service.' },
				pt: { placeholders: [], text: 'Esta viagem foi cancelada devido à ausência de condutor. Por favor, verifique opções alternativas ou contacte o serviço de atendimento ao cliente.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Rides canceled due to driver absence' },
				pt: { placeholders: [], text: 'Viagens canceladas devido à ausência de condutores' },
			},
			singular: {
				en: { placeholders: [], text: 'Ride canceled due to driver absence' },
				pt: { placeholders: [], text: 'Viagem cancelada devido à ausência de condutor' },
			},
		},
	},

	'DRIVER_ABSENCE:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Certain stops are temporarily without service due to driver absence. Please use nearby alternative stops or check customer service for guidance.' },
				pt: { placeholders: [], text: 'Algumas paragens estão temporariamente sem serviço devido à ausência de condutores. Por favor, utilize paragens alternativas próximas ou consulte o serviço de atendimento ao cliente para orientação.' },
			},
			singular: {
				en: { placeholders: [], text: 'This stop is temporarily without service due to driver absence. Please use nearby alternative stops or check customer service for guidance.' },
				pt: { placeholders: [], text: 'Esta paragem está temporariamente sem serviço devido à ausência de condutor. Por favor, utilize paragens alternativas próximas ou consulte o serviço de atendimento ao cliente para orientação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Stops without service due to driver absence' },
				pt: { placeholders: [], text: 'Paragens sem serviço devido à ausência de condutores' },
			},
			singular: {
				en: { placeholders: [], text: 'Stop without service due to driver absence' },
				pt: { placeholders: [], text: 'Paragem sem serviço devido à ausência de condutor' },
			},
		},
	},

	'DRIVER_ABSENCE:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'DRIVER_ABSENCE:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Significant delays are affecting multiple lines due to a shortage of drivers. We recommend planning additional travel time and checking for updates.' },
				pt: { placeholders: [], text: 'Atrasos significativos estão a afetar várias linhas devido à falta de condutores. Recomendamos planear tempo de viagem adicional e verificar atualizações.' },
			},
			singular: {
				en: { placeholders: [], text: 'Significant delays are affecting this line due to a shortage of drivers. Please allow extra travel time and check for updates.' },
				pt: { placeholders: [], text: 'Atrasos significativos estão a afetar esta linha devido à falta de condutores. Por favor, considere tempo de viagem adicional e verifique atualizações.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Multiple lines experiencing significant delays due to driver absence' },
				pt: { placeholders: [], text: 'Várias linhas com atrasos significativos devido à ausência de condutores' },
			},
			singular: {
				en: { placeholders: [], text: 'This line experiencing significant delays due to driver absence' },
				pt: { placeholders: [], text: 'Esta linha com atrasos significativos devido à ausência de condutor' },
			},
		},
	},

	'DRIVER_ABSENCE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Several rides are currently delayed due to insufficient drivers. Passengers are advised to check schedules and allow extra travel time.' },
				pt: { placeholders: [], text: 'Várias viagens estão atualmente atrasadas devido à falta de condutores. Os passageiros são aconselhados a verificar horários e prever tempo de viagem adicional.' },
			},
			singular: {
				en: { placeholders: [], text: 'This ride is currently delayed due to insufficient drivers. Please allow extra travel time and check schedules.' },
				pt: { placeholders: [], text: 'Esta viagem está atualmente atrasada devido à falta de condutores. Por favor, considere tempo adicional e verifique horários.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Multiple rides delayed due to driver shortage' },
				pt: { placeholders: [], text: 'Várias viagens atrasadas devido à falta de condutores' },
			},
			singular: {
				en: { placeholders: [], text: 'This ride delayed due to driver shortage' },
				pt: { placeholders: [], text: 'Esta viagem atrasada devido à falta de condutor' },
			},
		},
	},

	'DRIVER_ABSENCE:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Delays at multiple stops are occurring due to driver shortages. Please consider alternative routes or extra travel time.' },
				pt: { placeholders: [], text: 'Estão a ocorrer atrasos em várias paragens devido à falta de condutores. Considere rotas alternativas ou tempo de viagem adicional.' },
			},
			singular: {
				en: { placeholders: [], text: 'Delays at this stop are occurring due to driver shortages. Please allow extra travel time or consider alternative stops.' },
				pt: { placeholders: [], text: 'Estão a ocorrer atrasos nesta paragem devido à falta de condutores. Por favor, preveja tempo de viagem adicional ou considere paragens alternativas.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Delays at multiple stops due to driver absence' },
				pt: { placeholders: [], text: 'Atrasos em várias paragens devido à ausência de condutores' },
			},
			singular: {
				en: { placeholders: [], text: 'Delay at this stop due to driver absence' },
				pt: { placeholders: [], text: 'Atraso nesta paragem devido à ausência de condutor' },
			},
		},
	},

	'DRIVER_ISSUE:DETOUR:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'DRIVER_ISSUE:DETOUR:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Services on these lines are operating via a temporary detour due to driver-related issues. We recommend checking for schedule changes.' },
				pt: { placeholders: [], text: 'Os serviços nestas linhas estão a operar através de um desvio temporário devido a problemas relacionados com condutores. Recomendamos que consulte alterações de horários.' },
			},
			singular: {
				en: { placeholders: [], text: 'Service on this line is operating via a temporary detour due to driver-related issues. Please check schedule updates.' },
				pt: { placeholders: [], text: 'O serviço nesta linha está a operar através de um desvio temporário devido a problemas relacionados com condutores. Consulte os horários atualizados.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Temporary detour on selected lines due to driver issues' },
				pt: { placeholders: [], text: 'Desvio temporário em linhas selecionadas devido a problemas de condutores' },
			},
			singular: {
				en: { placeholders: [], text: 'Temporary detour on this line due to driver issues' },
				pt: { placeholders: [], text: 'Desvio temporário nesta linha devido a problemas de condutor' },
			},
		},
	},

	'DRIVER_ISSUE:DETOUR:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Certain rides are being rerouted temporarily due to driver availability problems. Check updated schedules before travel.' },
				pt: { placeholders: [], text: 'Algumas corridas estão a ser redirecionadas temporariamente devido a problemas de disponibilidade de condutores. Consulte os horários atualizados antes de viajar.' },
			},
			singular: {
				en: { placeholders: [], text: 'This ride is being rerouted temporarily due to driver availability problems. Check the updated schedule.' },
				pt: { placeholders: [], text: 'Esta corrida está a ser redirecionada temporariamente devido a problemas de disponibilidade de condutor. Consulte o horário atualizado.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Temporary ride detours due to driver issues' },
				pt: { placeholders: [], text: 'Desvios temporários de corridas devido a problemas de condutores' },
			},
			singular: {
				en: { placeholders: [], text: 'Temporary ride detour due to driver issues' },
				pt: { placeholders: [], text: 'Desvio temporário de corrida devido a problemas de condutor' },
			},
		},
	},

	'DRIVER_ISSUE:DETOUR:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Some stops are temporarily served via detour due to driver-related issues. Please consult local schedules for updates.' },
				pt: { placeholders: [], text: 'Algumas paragens estão temporariamente atendidas via desvio devido a problemas relacionados com condutores. Consulte os horários locais para atualizações.' },
			},
			singular: {
				en: { placeholders: [], text: 'This stop is temporarily served via detour due to driver-related issues. Check local schedules for updates.' },
				pt: { placeholders: [], text: 'Esta paragem está temporariamente atendida via desvio devido a problemas relacionados com condutores. Consulte os horários locais.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Temporary stop detours due to driver issues' },
				pt: { placeholders: [], text: 'Desvios temporários de paragens devido a problemas de condutores' },
			},
			singular: {
				en: { placeholders: [], text: 'Temporary stop detour due to driver issues' },
				pt: { placeholders: [], text: 'Desvio temporário de paragem devido a problemas de condutor' },
			},
		},
	},

	'DRIVER_ISSUE:NO_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'DRIVER_ISSUE:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a driver-related issue, service on the lines {line_short_name[]} has been canceled while this notice is in effect. Please use alternative routes or contact our customer service for more information. We thank you for your understanding while we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um problema relacionado com o motorista, o serviço nas linhas {line_short_name[]} foi interrompido enquanto este aviso estiver ativo. Por favor, utilize rotas alternativas ou entre em contacto connosco para mais informações. Agradecemos desde já a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a driver-related issue, service on the line {line_short_name} has been canceled while this notice is in effect. Please use alternative routes or contact our customer service for more information. We thank you for your understanding while we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um problema relacionado com o motorista, o serviço na linha {line_short_name} foi interrompido enquanto este aviso estiver ativo. Por favor, utilize rotas alternativas ou entre em contacto connosco para mais informações. Agradecemos desde já a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Driver issue causes temporary service disruption' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Problema com motorista provoca interrupção temporária no serviço' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Driver issue causes temporary service disruption' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Problema com motorista provoca interrupção temporária no serviço' },
			},
		},
	},

	'DRIVER_ISSUE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Service for several rides has been canceled due to driver availability issues. Please consider alternative options or contact customer service for assistance.' },
				pt: { placeholders: [], text: 'O serviço de várias viagens foi interrompido devido a problemas de disponibilidade de motoristas. Por favor, utilize alternativas ou entre em contato com o serviço de atendimento ao cliente.' },
			},
			singular: {
				en: { placeholders: [], text: 'Service for this ride has been canceled due to driver availability issues. Please consider alternative options or contact customer service for assistance.' },
				pt: { placeholders: [], text: 'O serviço desta viagem foi interrompido devido a problemas de disponibilidade de motoristas. Por favor, utilize alternativas ou entre em contato com o serviço de atendimento ao cliente.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Driver shortage causes ride cancellations' },
				pt: { placeholders: [], text: 'Falta de motoristas causa cancelamento de viagens' },
			},
			singular: {
				en: { placeholders: [], text: 'Driver shortage causes ride cancellation' },
				pt: { placeholders: [], text: 'Falta de motorista causa cancelamento da viagem' },
			},
		},
	},

	'DRIVER_ISSUE:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Several stops are not being served due to driver availability issues. Please plan alternative routes or contact customer service.' },
				pt: { placeholders: [], text: 'Vários pontos não estão sendo atendidos devido a problemas de disponibilidade de motoristas. Por favor, planeje rotas alternativas ou entre em contato com o serviço de atendimento ao cliente.' },
			},
			singular: {
				en: { placeholders: [], text: 'This stop is not being served due to driver availability issues. Please plan an alternative route or contact customer service.' },
				pt: { placeholders: [], text: 'Este ponto não está sendo atendido devido a problemas de disponibilidade de motoristas. Por favor, planeje uma rota alternativa ou entre em contato com o serviço de atendimento ao cliente.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Driver shortage causes multiple stops to be skipped' },
				pt: { placeholders: [], text: 'Falta de motoristas causa interrupção em vários pontos' },
			},
			singular: {
				en: { placeholders: [], text: 'Driver shortage causes stop to be skipped' },
				pt: { placeholders: [], text: 'Falta de motorista causa interrupção no ponto' },
			},
		},
	},

	'DRIVER_ISSUE:REDUCED_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'DRIVER_ISSUE:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Service on the lines {line_short_name[]} is currently reduced due to driver availability issues. Please expect longer waiting times.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'O serviço nas linhas {line_short_name[]} está atualmente reduzido devido a problemas de disponibilidade de motoristas. Aguarde tempos de espera mais longos.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Service on the line {line_short_name} is currently reduced due to driver availability issues. Please expect longer waiting times.' },
				pt: { placeholders: ['{line_short_name}'], text: 'O serviço na linha {line_short_name} está atualmente reduzido devido a problemas de disponibilidade de motoristas. Aguarde tempos de espera mais longos.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Reduced service due to driver shortage' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Serviço reduzido devido à falta de motoristas' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Reduced service due to driver shortage' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Serviço reduzido devido à falta de motoristas' },
			},
		},
	},

	'DRIVER_ISSUE:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Several rides are operating on a reduced schedule due to driver availability issues. Expect delays and limited service.' },
				pt: { placeholders: [], text: 'Várias viagens estão operando com horários reduzidos devido a problemas de disponibilidade de motoristas. Aguarde atrasos e serviço limitado.' },
			},
			singular: {
				en: { placeholders: [], text: 'This ride is operating on a reduced schedule due to driver availability issues. Expect delays and limited service.' },
				pt: { placeholders: [], text: 'Esta viagem está operando com horário reduzido devido a problemas de disponibilidade de motoristas. Aguarde atrasos e serviço limitado.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Driver shortage causes reduced ride service' },
				pt: { placeholders: [], text: 'Falta de motoristas causa redução no serviço de viagens' },
			},
			singular: {
				en: { placeholders: [], text: 'Driver shortage causes reduced ride service' },
				pt: { placeholders: [], text: 'Falta de motorista causa redução no serviço da viagem' },
			},
		},
	},

	'DRIVER_ISSUE:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Service at several stops is reduced due to driver availability issues. Please allow extra time for your journey.' },
				pt: { placeholders: [], text: 'O serviço em vários pontos está reduzido devido a problemas de disponibilidade de motoristas. Por favor, permita mais tempo para sua viagem.' },
			},
			singular: {
				en: { placeholders: [], text: 'Service at this stop is reduced due to driver availability issues. Please allow extra time for your journey.' },
				pt: { placeholders: [], text: 'O serviço neste ponto está reduzido devido a problemas de disponibilidade de motoristas. Por favor, permita mais tempo para sua viagem.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Driver shortage reduces stop service' },
				pt: { placeholders: [], text: 'Falta de motoristas reduz o serviço nos pontos' },
			},
			singular: {
				en: { placeholders: [], text: 'Driver shortage reduces stop service' },
				pt: { placeholders: [], text: 'Falta de motorista reduz o serviço no ponto' },
			},
		},
	},

	'DRIVER_ISSUE:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'DRIVER_ISSUE:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Expect significant delays on the lines {line_short_name[]} due to driver availability issues. Please plan your journey accordingly.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Espere atrasos significativos nas linhas {line_short_name[]} devido a problemas de disponibilidade de motoristas. Planeje sua viagem de acordo.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Expect significant delays on the line {line_short_name} due to driver availability issues. Please plan your journey accordingly.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Espere atrasos significativos na linha {line_short_name} devido a problemas de disponibilidade de motoristas. Planeje sua viagem de acordo.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Significant delays due to driver shortage' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Atrasos significativos devido à falta de motoristas' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Significant delays due to driver shortage' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Atrasos significativos devido à falta de motoristas' },
			},
		},
	},

	'DRIVER_ISSUE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Several rides are experiencing significant delays due to driver availability issues. Expect longer travel times.' },
				pt: { placeholders: [], text: 'Várias viagens estão enfrentando atrasos significativos devido a problemas de disponibilidade de motoristas. Aguarde tempos de viagem mais longos.' },
			},
			singular: {
				en: { placeholders: [], text: 'This ride is experiencing significant delays due to driver availability issues. Expect a longer travel time.' },
				pt: { placeholders: [], text: 'Esta viagem está enfrentando atrasos significativos devido a problemas de disponibilidade de motoristas. Aguarde um tempo de viagem maior.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Driver shortage causes significant ride delays' },
				pt: { placeholders: [], text: 'Falta de motoristas causa atrasos significativos nas viagens' },
			},
			singular: {
				en: { placeholders: [], text: 'Driver shortage causes significant ride delays' },
				pt: { placeholders: [], text: 'Falta de motorista causa atrasos significativos na viagem' },
			},
		},
	},

	'DRIVER_ISSUE:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Expect significant delays at several stops due to driver availability issues. Please allow extra time.' },
				pt: { placeholders: [], text: 'Espere atrasos significativos em vários pontos devido a problemas de disponibilidade de motoristas. Por favor, permita mais tempo.' },
			},
			singular: {
				en: { placeholders: [], text: 'Expect significant delays at this stop due to driver availability issues. Please allow extra time.' },
				pt: { placeholders: [], text: 'Espere atrasos significativos neste ponto devido a problemas de disponibilidade de motoristas. Por favor, permita mais tempo.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Driver shortage causes significant stop delays' },
				pt: { placeholders: [], text: 'Falta de motoristas causa atrasos significativos nos pontos' },
			},
			singular: {
				en: { placeholders: [], text: 'Driver shortage causes significant stop delays' },
				pt: { placeholders: [], text: 'Falta de motorista causa atrasos significativos no ponto' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:ACCESSIBILITY_ISSUE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'High passenger load on the lines {line_short_name[]} is causing accessibility issues. Please plan accordingly and allow extra time.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'A alta carga de passageiros nas linhas {line_short_name[]} está causando problemas de acessibilidade. Planeje-se adequadamente e permita mais tempo.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'High passenger load on the line {line_short_name} is causing accessibility issues. Please plan accordingly and allow extra time.' },
				pt: { placeholders: ['{line_short_name}'], text: 'A alta carga de passageiros na linha {line_short_name} está causando problemas de acessibilidade. Planeje-se adequadamente e permita mais tempo.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Accessibility impacted by high passenger load' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acessibilidade afetada por alta carga de passageiros' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Accessibility impacted by high passenger load' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acessibilidade afetada por alta carga de passageiros' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:ADDITIONAL_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:DETOUR:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'MEDICAL_EMERGENCY:DETOUR:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:DETOUR:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:DETOUR:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:NO_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'MEDICAL_EMERGENCY:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:REDUCED_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'MEDICAL_EMERGENCY:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'MEDICAL_EMERGENCY:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:DETOUR:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'POLICE_ACTIVITY:DETOUR:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:DETOUR:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:DETOUR:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:NO_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'POLICE_ACTIVITY:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:REDUCED_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'POLICE_ACTIVITY:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'POLICE_ACTIVITY:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'PUBLIC_DISORDER:DETOUR:agency': undefined,

	'PUBLIC_DISORDER:DETOUR:lines': undefined,

	'PUBLIC_DISORDER:DETOUR:rides': undefined,

	'PUBLIC_DISORDER:DETOUR:stops': undefined,

	'PUBLIC_DISORDER:NO_SERVICE:agency': undefined,

	'PUBLIC_DISORDER:NO_SERVICE:lines': undefined,

	'PUBLIC_DISORDER:NO_SERVICE:rides': undefined,

	'PUBLIC_DISORDER:NO_SERVICE:stops': undefined,

	'PUBLIC_DISORDER:REDUCED_SERVICE:agency': undefined,

	'PUBLIC_DISORDER:REDUCED_SERVICE:lines': undefined,

	'PUBLIC_DISORDER:REDUCED_SERVICE:rides': undefined,

	'PUBLIC_DISORDER:REDUCED_SERVICE:stops': undefined,

	'PUBLIC_DISORDER:SIGNIFICANT_DELAYS:agency': undefined,

	'PUBLIC_DISORDER:SIGNIFICANT_DELAYS:lines': undefined,

	'PUBLIC_DISORDER:SIGNIFICANT_DELAYS:rides': undefined,

	'PUBLIC_DISORDER:SIGNIFICANT_DELAYS:stops': undefined,

	'ROAD_ISSUE:ACCESSIBILITY_ISSUE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'ROAD_ISSUE:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'ROAD_ISSUE:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'ROAD_ISSUE:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'ROAD_ISSUE:DETOUR:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'ROAD_ISSUE:DETOUR:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'ROAD_ISSUE:DETOUR:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'ROAD_ISSUE:DETOUR:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'ROAD_ISSUE:NO_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'ROAD_ISSUE:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'ROAD_ISSUE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'ROAD_ISSUE:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'ROAD_ISSUE:REDUCED_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'ROAD_ISSUE:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'ROAD_ISSUE:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'ROAD_ISSUE:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'ROAD_ISSUE:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'ROAD_ISSUE:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'ROAD_ISSUE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'ROAD_ISSUE:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'STRIKE:ADDITIONAL_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'STRIKE:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'STRIKE:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'STRIKE:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'STRIKE:DETOUR:agency': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'STRIKE:DETOUR:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'STRIKE:DETOUR:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'STRIKE:DETOUR:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'STRIKE:NO_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'STRIKE:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'STRIKE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'STRIKE:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'STRIKE:REDUCED_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'STRIKE:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'STRIKE:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'STRIKE:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'STRIKE:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'STRIKE:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'STRIKE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'STRIKE:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:ACCESSIBILITY_ISSUE:agency': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:NO_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:ON_BOARD_SALE_ISSUE:agency': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:ON_BOARD_SALE_ISSUE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:ON_BOARD_SALE_ISSUE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:ON_BOARD_SALE_ISSUE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:REALTIME_INFO_ISSUE:agency': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:REALTIME_INFO_ISSUE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:REALTIME_INFO_ISSUE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:REALTIME_INFO_ISSUE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:REDUCED_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TECHNICAL_ISSUE:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:DETOUR:agency': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:DETOUR:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:DETOUR:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:DETOUR:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:NO_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:REDUCED_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'WEATHER:ACCESSIBILITY_ISSUE:agency': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'WEATHER:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'WEATHER:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'WEATHER:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'WEATHER:DETOUR:agency': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'WEATHER:DETOUR:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'WEATHER:DETOUR:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'WEATHER:DETOUR:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'WEATHER:NO_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'WEATHER:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'WEATHER:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'WEATHER:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'WEATHER:REDUCED_SERVICE:agency': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'WEATHER:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'WEATHER:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'WEATHER:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'WEATHER:SIGNIFICANT_DELAYS:agency': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'WEATHER:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'WEATHER:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

	'WEATHER:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
			singular: {
				en: { placeholders: [], text: '' },
				pt: { placeholders: [], text: '' },
			},
		},
	},

};
