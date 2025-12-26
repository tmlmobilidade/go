/* * */

import { type AlertTemplateRegistry } from '@/types.js';

/**
 * Alert i18n templates registry
 * Each key is formed by the combination of cause, effect and reference_type of an alert
 * in the format: 'CAUSE:EFFECT:REFERENCE_TYPE'
 */
export const alertI18nTemplateEffects: AlertTemplateRegistry = {

	'ACCIDENT:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: 'Due to a road accident, accessibility services on the lines {line_short_name[]} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { params: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade nas linhas {line_short_name[]} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: 'Due to a road accident, accessibility services on the line {line_short_name} have been temporarily suspended while this notice is in effect. Please consider alternative routes or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { params: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, os serviços de acessibilidade na linha {line_short_name} foram temporariamente suspensos enquanto este aviso estiver ativo. Por favor, considere rotas alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident affects accessibility services' },
				pt: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: '{line_short_name} | Road accident affects accessibility services' },
				pt: { params: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca impacto nos serviços de acessibilidade' },
			},
		},
	},

	'ACCIDENT:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: 'Due to a road accident, additional services have been arranged on the lines {line_short_name[]} while this notice is in effect. Please check schedules or contact our customer service for more information. We appreciate your understanding as we work to manage the situation.' },
				pt: { params: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, foram organizados serviços adicionais nas linhas {line_short_name[]} enquanto este aviso estiver ativo. Por favor, verifique os horários ou entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: 'Due to a road accident, an additional service has been arranged on the line {line_short_name} while this notice is in effect. Please check schedules or contact our customer service for more information. We appreciate your understanding as we work to manage the situation.' },
				pt: { params: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, foi organizado um serviço adicional na linha {line_short_name} enquanto este aviso estiver ativo. Por favor, verifique os horários ou entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
		},
		title: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Additional services arranged due to road accident' },
				pt: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Serviços adicionais organizados devido a acidente rodoviário' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: '{line_short_name} | Additional service arranged due to road accident' },
				pt: { params: ['{line_short_name}'], text: '{line_short_name} | Serviço adicional organizado devido a acidente rodoviário' },
			},
		},
	},

	'ACCIDENT:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:DETOUR:lines': {
		description: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: 'Due to a road accident, the lines {line_short_name[]} are operating on a detour while this notice is in effect. Please follow posted signage or contact our customer service for guidance. We appreciate your patience as we manage the situation.' },
				pt: { params: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, as linhas {line_short_name[]} estão a operar em desvio enquanto este aviso estiver ativo. Por favor, siga a sinalização ou entre em contacto connosco para orientação. Agradecemos a sua paciência enquanto gerimos a situação.' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: 'Due to a road accident, the line {line_short_name} is operating on a detour while this notice is in effect. Please follow posted signage or contact our customer service for guidance. We appreciate your patience as we manage the situation.' },
				pt: { params: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, a linha {line_short_name} está a operar em desvio enquanto este aviso estiver ativo. Por favor, siga a sinalização ou entre em contacto connosco para orientação. Agradecemos a sua paciência enquanto gerimos a situação.' },
			},
		},
		title: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident causes temporary detour' },
				pt: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca desvio temporário' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: '{line_short_name} | Road accident causes temporary detour' },
				pt: { params: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca desvio temporário' },
			},
		},
	},

	'ACCIDENT:DETOUR:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:DETOUR:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: 'Due to a road accident, the service on the lines {line_short_name[]} has been modified while this notice is in effect. Please check updated schedules or contact our customer service for further details. We thank you for your understanding as we work to restore normal service.' },
				pt: { params: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, o serviço nas linhas {line_short_name[]} foi modificado enquanto este aviso estiver ativo. Por favor, verifique os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão enquanto trabalhamos para restaurar o serviço normal.' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: 'Due to a road accident, the service on the line {line_short_name} has been modified while this notice is in effect. Please check updated schedules or contact our customer service for further details. We thank you for your understanding as we work to restore normal service.' },
				pt: { params: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, o serviço na linha {line_short_name} foi modificado enquanto este aviso estiver ativo. Por favor, verifique os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão enquanto trabalhamos para restaurar o serviço normal.' },
			},
		},
		title: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Service modified due to road accident' },
				pt: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Serviço modificado devido a acidente rodoviário' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: '{line_short_name} | Service modified due to road accident' },
				pt: { params: ['{line_short_name}'], text: '{line_short_name} | Serviço modificado devido a acidente rodoviário' },
			},
		},
	},

	'ACCIDENT:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:NO_EFFECT:lines': {
		description: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: 'A road accident has occurred, but there is no impact on the service of the lines {line_short_name[]}. Services are running normally. Please contact our customer service for any additional information.' },
				pt: { params: ['{line_short_name[]}'], text: 'Ocorreu um acidente rodoviário, mas não há impacto no serviço das linhas {line_short_name[]}. Os serviços estão a operar normalmente. Por favor, entre em contacto connosco para mais informações.' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: 'A road accident has occurred, but there is no impact on the service of the line {line_short_name}. Services are running normally. Please contact our customer service for any additional information.' },
				pt: { params: ['{line_short_name}'], text: 'Ocorreu um acidente rodoviário, mas não há impacto no serviço da linha {line_short_name}. Os serviços estão a operar normalmente. Por favor, entre em contacto connosco para mais informações.' },
			},
		},
		title: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident has no impact on service' },
				pt: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente rodoviário não afeta o serviço' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: '{line_short_name} | Road accident has no impact on service' },
				pt: { params: ['{line_short_name}'], text: '{line_short_name} | Acidente rodoviário não afeta o serviço' },
			},
		},
	},

	'ACCIDENT:NO_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:NO_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: 'Due to a road accident, service on the lines {line_short_name[]} has been canceled while this notice is in effect. Please use alternative routes or contact our customer service for more information. We thank you for your understanding while we work to resolve the situation.' },
				pt: { params: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, o serviço nas linhas {line_short_name[]} foi interrompido enquanto este aviso estiver ativo. Por favor, utilize rotas alternativas ou entre em contacto connosco para mais informações. Agradecemos desde já a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: 'Due to a road accident, service on the line {line_short_name} has been canceled while this notice is in effect. Please use alternative routes or contact our customer service for more information. We thank you for your understanding while we work to resolve the situation.' },
				pt: { params: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, o serviço na linha {line_short_name} foi interrompido enquanto este aviso estiver ativo. Por favor, utilize rotas alternativas ou entre em contacto connosco para mais informações. Agradecemos desde já a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident causes temporary service disruption' },
				pt: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente provoca interrupção temporária no serviço' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: '{line_short_name} | Road accident causes temporary service disruption' },
				pt: { params: ['{line_short_name}'], text: '{line_short_name} | Acidente provoca interrupção temporária no serviço' },
			},
		},
	},

	'ACCIDENT:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:OTHER_EFFECT:lines': {
		description: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: 'Due to a road accident, the lines {line_short_name[]} may experience other temporary effects while this notice is in effect. Please stay informed via our customer service or official channels for the latest updates. We appreciate your understanding as we manage the situation.' },
				pt: { params: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, as linhas {line_short_name[]} podem sofrer outros efeitos temporários enquanto este aviso estiver ativo. Por favor, mantenha-se informado através do nosso serviço de atendimento ao cliente ou canais oficiais para as últimas atualizações. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: 'Due to a road accident, the line {line_short_name} may experience other temporary effects while this notice is in effect. Please stay informed via our customer service or official channels for the latest updates. We appreciate your understanding as we manage the situation.' },
				pt: { params: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, a linha {line_short_name} pode sofrer outros efeitos temporários enquanto este aviso estiver ativo. Por favor, mantenha-se informado através do nosso serviço de atendimento ao cliente ou canais oficiais para as últimas atualizações. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
		},
		title: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Road accident may cause other temporary effects' },
				pt: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Acidente pode causar outros efeitos temporários' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: '{line_short_name} | Road accident may cause other temporary effects' },
				pt: { params: ['{line_short_name}'], text: '{line_short_name} | Acidente pode causar outros efeitos temporários' },
			},
		},
	},

	'ACCIDENT:OTHER_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:OTHER_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: 'Due to a road accident, service on the lines {line_short_name[]} is operating with reduced frequency while this notice is in effect. Please plan your journey accordingly and contact our customer service for additional information. We appreciate your understanding as we manage the situation.' },
				pt: { params: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, o serviço nas linhas {line_short_name[]} está a operar com frequência reduzida enquanto este aviso estiver ativo. Por favor, planeie a sua viagem em conformidade e entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: 'Due to a road accident, service on the line {line_short_name} is operating with reduced frequency while this notice is in effect. Please plan your journey accordingly and contact our customer service for additional information. We appreciate your understanding as we manage the situation.' },
				pt: { params: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, o serviço na linha {line_short_name} está a operar com frequência reduzida enquanto este aviso estiver ativo. Por favor, planeie a sua viagem em conformidade e entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
		},
		title: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Service operating at reduced frequency due to road accident' },
				pt: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Serviço com frequência reduzida devido a acidente rodoviário' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: '{line_short_name} | Service operating at reduced frequency due to road accident' },
				pt: { params: ['{line_short_name}'], text: '{line_short_name} | Serviço com frequência reduzida devido a acidente rodoviário' },
			},
		},
	},

	'ACCIDENT:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: 'Due to a road accident, the lines {line_short_name[]} are experiencing significant delays while this notice is in effect. Please allow extra travel time and contact our customer service for the latest updates. We appreciate your patience as we manage the situation.' },
				pt: { params: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, as linhas {line_short_name[]} estão a sofrer atrasos significativos enquanto este aviso estiver ativo. Por favor, reserve mais tempo para a sua viagem e entre em contacto connosco para as últimas atualizações. Agradecemos a sua paciência enquanto gerimos a situação.' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: 'Due to a road accident, the line {line_short_name} is experiencing significant delays while this notice is in effect. Please allow extra travel time and contact our customer service for the latest updates. We appreciate your patience as we manage the situation.' },
				pt: { params: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, a linha {line_short_name} está a sofrer atrasos significativos enquanto este aviso estiver ativo. Por favor, reserve mais tempo para a sua viagem e entre em contacto connosco para as últimas atualizações. Agradecemos a sua paciência enquanto gerimos a situação.' },
			},
		},
		title: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Significant delays due to road accident' },
				pt: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Atrasos significativos devido a acidente rodoviário' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: '{line_short_name} | Significant delays due to road accident' },
				pt: { params: ['{line_short_name}'], text: '{line_short_name} | Atrasos significativos devido a acidente rodoviário' },
			},
		},
	},

	'ACCIDENT:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: 'Due to a road accident, stops on the lines {line_short_name[]} have been temporarily relocated while this notice is in effect. Please follow posted signage or contact our customer service for details. We appreciate your cooperation as we manage the situation.' },
				pt: { params: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os pontos de paragem nas linhas {line_short_name[]} foram temporariamente relocados enquanto este aviso estiver ativo. Por favor, siga a sinalização ou entre em contacto connosco para mais detalhes. Agradecemos a sua colaboração enquanto gerimos a situação.' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: 'Due to a road accident, the stop on the line {line_short_name} has been temporarily relocated while this notice is in effect. Please follow posted signage or contact our customer service for details. We appreciate your cooperation as we manage the situation.' },
				pt: { params: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, o ponto de paragem na linha {line_short_name} foi temporariamente relocado enquanto este aviso estiver ativo. Por favor, siga a sinalização ou entre em contacto connosco para mais detalhes. Agradecemos a sua colaboração enquanto gerimos a situação.' },
			},
		},
		title: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Stops temporarily relocated due to road accident' },
				pt: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Pontos de paragem temporariamente relocados devido a acidente rodoviário' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: '{line_short_name} | Stop temporarily relocated due to road accident' },
				pt: { params: ['{line_short_name}'], text: '{line_short_name} | Ponto de paragem temporariamente relocados devido a acidente rodoviário' },
			},
		},
	},

	'ACCIDENT:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:UNKNOWN_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:UNKNOWN_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ACCIDENT:UNKNOWN_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:DETOUR:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:DETOUR:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:DETOUR:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:NO_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:NO_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:NO_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:OTHER_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:OTHER_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:OTHER_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:UNKNOWN_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:UNKNOWN_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'CONSTRUCTION:UNKNOWN_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:DETOUR:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:DETOUR:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:DETOUR:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:NO_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:NO_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:NO_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:OTHER_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:OTHER_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:OTHER_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:UNKNOWN_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:UNKNOWN_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DEMONSTRATION:UNKNOWN_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:DETOUR:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:DETOUR:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:DETOUR:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:NO_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:NO_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:NO_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:OTHER_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:OTHER_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:OTHER_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:UNKNOWN_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:UNKNOWN_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ABSENCE:UNKNOWN_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:DETOUR:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:DETOUR:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:DETOUR:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:NO_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:NO_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:NO_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: 'Due to a driver-related issue, service on the lines {line_short_name[]} has been canceled while this notice is in effect. Please use alternative routes or contact our customer service for more information. We thank you for your understanding while we work to resolve the situation.' },
				pt: { params: ['{line_short_name[]}'], text: 'Devido a um problema relacionado com o motorista, o serviço nas linhas {line_short_name[]} foi interrompido enquanto este aviso estiver ativo. Por favor, utilize rotas alternativas ou entre em contacto connosco para mais informações. Agradecemos desde já a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: 'Due to a driver-related issue, service on the line {line_short_name} has been canceled while this notice is in effect. Please use alternative routes or contact our customer service for more information. We thank you for your understanding while we work to resolve the situation.' },
				pt: { params: ['{line_short_name}'], text: 'Devido a um problema relacionado com o motorista, o serviço na linha {line_short_name} foi interrompido enquanto este aviso estiver ativo. Por favor, utilize rotas alternativas ou entre em contacto connosco para mais informações. Agradecemos desde já a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Driver issue causes temporary service disruption' },
				pt: { params: ['{line_short_name[]}'], text: '{line_short_name[]} | Problema com motorista provoca interrupção temporária no serviço' },
			},
			singular: {
				en: { params: ['{line_short_name}'], text: '{line_short_name} | Driver issue causes temporary service disruption' },
				pt: { params: ['{line_short_name}'], text: '{line_short_name} | Problema com motorista provoca interrupção temporária no serviço' },
			},
		},
	},

	'DRIVER_ISSUE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:OTHER_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:OTHER_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:OTHER_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:UNKNOWN_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:UNKNOWN_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'DRIVER_ISSUE:UNKNOWN_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:DETOUR:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:DETOUR:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:DETOUR:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:NO_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:NO_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:NO_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:OTHER_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:OTHER_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:OTHER_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:UNKNOWN_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:UNKNOWN_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HIGH_PASSENGER_LOAD:UNKNOWN_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:DETOUR:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:DETOUR:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:DETOUR:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:NO_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:NO_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:NO_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:OTHER_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:OTHER_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:OTHER_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:UNKNOWN_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:UNKNOWN_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'HOLIDAY:UNKNOWN_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:DETOUR:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:DETOUR:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:DETOUR:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:NO_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:NO_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:NO_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:OTHER_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:OTHER_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:OTHER_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:UNKNOWN_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:UNKNOWN_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MAINTENANCE:UNKNOWN_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:DETOUR:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:DETOUR:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:DETOUR:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:NO_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:NO_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:NO_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:OTHER_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:OTHER_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:OTHER_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:UNKNOWN_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:UNKNOWN_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'MEDICAL_EMERGENCY:UNKNOWN_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:DETOUR:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:DETOUR:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:DETOUR:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:NO_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:NO_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:NO_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:OTHER_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:OTHER_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:OTHER_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:UNKNOWN_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:UNKNOWN_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'OTHER_CAUSE:UNKNOWN_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:DETOUR:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:DETOUR:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:DETOUR:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:NO_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:NO_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:NO_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:OTHER_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:OTHER_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:OTHER_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:UNKNOWN_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:UNKNOWN_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'POLICE_ACTIVITY:UNKNOWN_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:DETOUR:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:DETOUR:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:DETOUR:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:NO_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:NO_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:NO_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:OTHER_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:OTHER_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:OTHER_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:UNKNOWN_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:UNKNOWN_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'ROAD_INCIDENT:UNKNOWN_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:DETOUR:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:DETOUR:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:DETOUR:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:NO_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:NO_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:NO_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:OTHER_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:OTHER_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:OTHER_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:UNKNOWN_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:UNKNOWN_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'STRIKE:UNKNOWN_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:DETOUR:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:DETOUR:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:DETOUR:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:NO_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:NO_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:NO_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:OTHER_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:OTHER_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:OTHER_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:UNKNOWN_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:UNKNOWN_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'SYSTEM_FAILURE:UNKNOWN_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:DETOUR:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:DETOUR:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:DETOUR:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:NO_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:NO_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:NO_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:OTHER_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:OTHER_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:OTHER_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:UNKNOWN_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:UNKNOWN_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TECHNICAL_PROBLEM:UNKNOWN_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:DETOUR:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:DETOUR:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:DETOUR:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:NO_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:NO_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:NO_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:OTHER_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:OTHER_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:OTHER_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:UNKNOWN_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:UNKNOWN_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'TRAFFIC_JAM:UNKNOWN_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:DETOUR:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:DETOUR:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:DETOUR:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:NO_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:NO_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:NO_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:OTHER_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:OTHER_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:OTHER_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:UNKNOWN_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:UNKNOWN_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'UNKNOWN_CAUSE:UNKNOWN_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:DETOUR:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:DETOUR:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:DETOUR:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:NO_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:NO_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:NO_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:OTHER_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:OTHER_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:OTHER_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:UNKNOWN_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:UNKNOWN_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'VEHICLE_ISSUE:UNKNOWN_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:DETOUR:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:DETOUR:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:DETOUR:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:NO_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:NO_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:NO_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:NO_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:NO_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:NO_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:OTHER_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:OTHER_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:OTHER_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:REDUCED_SERVICE:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:REDUCED_SERVICE:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:REDUCED_SERVICE:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:SIGNIFICANT_DELAYS:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:SIGNIFICANT_DELAYS:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:SIGNIFICANT_DELAYS:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:UNKNOWN_EFFECT:lines': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:UNKNOWN_EFFECT:rides': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

	'WEATHER:UNKNOWN_EFFECT:stops': {
		description: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
		title: {
			plural: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
			singular: {
				en: { params: [], text: '' },
				pt: { params: [], text: '' },
			},
		},
	},

};
