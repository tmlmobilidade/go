/* * */

import { type AlertConfigKey, type TemplateFragment } from '@/types.js';

/**
 * Alert i18n templates registry
 * Each key is formed by the combination of cause, effect and reference_type of an alert
 * in the format: 'CAUSE:EFFECT:REFERENCE_TYPE'
 */
export const alertI18nTemplates: Record<AlertConfigKey, TemplateFragment> = {

	'ACCIDENT:ACCESSIBILITY_ISSUE:lines': {
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

	'ACCIDENT:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { placeholders: ['{rides_description}'], text: 'Due to a road accident, accessibility features on the rides {rides_description} are temporarily unavailable while this notice is in effect. Please consider alternative options or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{rides_description}'], text: 'Devido a um acidente rodoviário, as funcionalidades de acessibilidade {rides_description} estão temporariamente indisponíveis enquanto este aviso estiver ativo. Por favor, considere alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{rides_description}'], text: 'Due to a road accident, accessibility features on the ride {rides_description} are temporarily unavailable while this notice is in effect. Please consider alternative options or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{rides_description}'], text: 'Devido a um acidente rodoviário, as funcionalidades de acessibilidade {rides_description} estão temporariamente indisponíveis enquanto este aviso estiver ativo. Por favor, considere alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			singular: {
				en: { placeholders: ['{rides_title}'], text: '{rides_title} | Road accident affects accessibility features' },
				pt: { placeholders: ['{rides_title}'], text: '{rides_title} | Acidente afeta funcionalidades de acessibilidade' },
			},
		},
	},

	'ACCIDENT:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: 'Due to a road accident, accessibility features at the stops {stop_name[]} are temporarily unavailable while this notice is in effect. Please consider alternative stops or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{stop_name[]}'], text: 'Devido a um acidente rodoviário, as condições de acessibilidade nas paragens {stop_name[]} estão temporariamente indisponíveis enquanto este aviso estiver ativo. Por favor, considere paragens alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: 'Due to a road accident, accessibility features at the stop {stop_name} are temporarily unavailable while this notice is in effect. Please consider alternative stops or contact our customer service for assistance. We appreciate your understanding as we work to resolve the situation.' },
				pt: { placeholders: ['{stop_name}'], text: 'Devido a um acidente rodoviário, as condições de acessibilidade na paragem {stop_name} estão temporariamente indisponíveis enquanto este aviso estiver ativo. Por favor, considere paragens alternativas ou entre em contacto connosco para assistência. Agradecemos a sua compreensão enquanto resolvemos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Road accident affects stop accessibility' },
				pt: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Acidente afeta a acessibilidade nas paragens' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: '{stop_name} | Road accident affects stop accessibility' },
				pt: { placeholders: ['{stop_name}'], text: '{stop_name} | Acidente afeta a acessibilidade na paragem' },
			},
		},
	},

	'ACCIDENT:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, additional services have been arranged on the lines {line_short_name[]} while this notice is in effect. Please check schedules or contact our customer service for more information. We appreciate your understanding as we work to manage the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, foram organizados serviços adicionais nas linhas {line_short_name[]} enquanto este aviso estiver ativo. Por favor, verifique os horários ou entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, an additional service has been arranged on the line {line_short_name} while this notice is in effect. Please check schedules or contact our customer service for more information. We appreciate your understanding as we work to manage the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, foi organizado um serviço adicional na linha {line_short_name} enquanto este aviso estiver ativo. Por favor, verifique os horários ou entre em contacto connosco para mais informações. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Additional services arranged due to road accident' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Serviços adicionais organizados devido a acidente rodoviário' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Additional service arranged due to road accident' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Serviço adicional organizado devido a acidente rodoviário' },
			},
		},
	},

	'ACCIDENT:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: 'Due to a road accident, additional rides have been arranged for {ride_short_name[]} while this notice is in effect. Please check updated information or contact our customer service for further details. We appreciate your understanding as we manage the situation.' },
				pt: { placeholders: ['{ride_short_name[]}'], text: 'Devido a um acidente rodoviário, foram organizadas viagens adicionais para {ride_short_name[]} enquanto este aviso estiver ativo. Por favor, consulte as informações atualizadas ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: 'Due to a road accident, an additional ride has been arranged for {ride_short_name} while this notice is in effect. Please check updated information or contact our customer service for further details. We appreciate your understanding as we manage the situation.' },
				pt: { placeholders: ['{ride_short_name}'], text: 'Devido a um acidente rodoviário, foi organizada uma viagem adicional para {ride_short_name} enquanto este aviso estiver ativo. Por favor, consulte as informações atualizadas ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Additional rides arranged due to road accident' },
				pt: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Viagens adicionais organizadas devido a acidente rodoviário' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Additional ride arranged due to road accident' },
				pt: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Viagem adicional organizada devido a acidente rodoviário' },
			},
		},
	},

	'ACCIDENT:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: 'Due to a road accident, additional service has been provided at the stops {stop_name[]} while this notice is in effect. Please check updated information or contact our customer service for further details. We appreciate your understanding as we manage the situation.' },
				pt: { placeholders: ['{stop_name[]}'], text: 'Devido a um acidente rodoviário, foi disponibilizado serviço adicional nas paragens {stop_name[]} enquanto este aviso estiver ativo. Por favor, consulte as informações atualizadas ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: 'Due to a road accident, additional service has been provided at the stop {stop_name} while this notice is in effect. Please check updated information or contact our customer service for further details. We appreciate your understanding as we manage the situation.' },
				pt: { placeholders: ['{stop_name}'], text: 'Devido a um acidente rodoviário, foi disponibilizado serviço adicional na paragem {stop_name} enquanto este aviso estiver ativo. Por favor, consulte as informações atualizadas ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Additional service provided due to road accident' },
				pt: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Serviço adicional disponibilizado devido a acidente rodoviário' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: '{stop_name} | Additional service provided due to road accident' },
				pt: { placeholders: ['{stop_name}'], text: '{stop_name} | Serviço adicional disponibilizado devido a acidente rodoviário' },
			},
		},
	},

	'ACCIDENT:DETOUR:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, the lines {line_short_name[]} are operating on a detour while this notice is in effect. Please follow posted signage or contact our customer service for guidance. We appreciate your patience as we manage the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, as linhas {line_short_name[]} estão a operar em desvio enquanto este aviso estiver ativo. Por favor, siga a sinalização ou entre em contacto connosco para orientação. Agradecemos a sua paciência enquanto gerimos a situação.' },
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

	'ACCIDENT:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, the service on the lines {line_short_name[]} has been modified while this notice is in effect. Please check updated schedules or contact our customer service for further details. We thank you for your understanding as we work to restore normal service.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, o serviço nas linhas {line_short_name[]} foi modificado enquanto este aviso estiver ativo. Por favor, verifique os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão enquanto trabalhamos para restaurar o serviço normal.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, the service on the line {line_short_name} has been modified while this notice is in effect. Please check updated schedules or contact our customer service for further details. We thank you for your understanding as we work to restore normal service.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, o serviço na linha {line_short_name} foi modificado enquanto este aviso estiver ativo. Por favor, verifique os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão enquanto trabalhamos para restaurar o serviço normal.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Service modified due to road accident' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Serviço modificado devido a acidente rodoviário' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Service modified due to road accident' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Serviço modificado devido a acidente rodoviário' },
			},
		},
	},

	'ACCIDENT:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: 'Due to a road accident, the rides {ride_short_name[]} are operating with a modified service while this notice is in effect. Please check updated information or contact our customer service for further details. We thank you for your understanding as we work to restore normal operations.' },
				pt: { placeholders: ['{ride_short_name[]}'], text: 'Devido a um acidente rodoviário, as viagens {ride_short_name[]} estão a operar com serviço modificado enquanto este aviso estiver ativo. Por favor, consulte as informações atualizadas ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão enquanto trabalhamos para restaurar a operação normal.' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: 'Due to a road accident, the ride {ride_short_name} is operating with a modified service while this notice is in effect. Please check updated information or contact our customer service for further details. We thank you for your understanding as we work to restore normal operations.' },
				pt: { placeholders: ['{ride_short_name}'], text: 'Devido a um acidente rodoviário, a viagem {ride_short_name} está a operar com serviço modificado enquanto este aviso estiver ativo. Por favor, consulte as informações atualizadas ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão enquanto trabalhamos para restaurar a operação normal.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Service modified due to road accident' },
				pt: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Serviço modificado devido a acidente rodoviário' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Service modified due to road accident' },
				pt: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Serviço modificado devido a acidente rodoviário' },
			},
		},
	},

	'ACCIDENT:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: 'Due to a road accident, service conditions at the stops {stop_name[]} have been modified while this notice is in effect. Please follow updated information on site or contact our customer service for further details. We thank you for your understanding as we work to restore normal service.' },
				pt: { placeholders: ['{stop_name[]}'], text: 'Devido a um acidente rodoviário, as condições de serviço nas paragens {stop_name[]} foram modificadas enquanto este aviso estiver ativo. Por favor, consulte a informação atualizada no local ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão enquanto trabalhamos para restaurar o serviço normal.' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: 'Due to a road accident, service conditions at the stop {stop_name} have been modified while this notice is in effect. Please follow updated information on site or contact our customer service for further details. We thank you for your understanding as we work to restore normal service.' },
				pt: { placeholders: ['{stop_name}'], text: 'Devido a um acidente rodoviário, as condições de serviço na paragem {stop_name} foram modificadas enquanto este aviso estiver ativo. Por favor, consulte a informação atualizada no local ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão enquanto trabalhamos para restaurar o serviço normal.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Service conditions modified due to road accident' },
				pt: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Condições de serviço modificadas devido a acidente rodoviário' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: '{stop_name} | Service conditions modified due to road accident' },
				pt: { placeholders: ['{stop_name}'], text: '{stop_name} | Condições de serviço modificadas devido a acidente rodoviário' },
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

	'ACCIDENT:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to a road accident, stops on the lines {line_short_name[]} have been temporarily relocated while this notice is in effect. Please follow posted signage or contact our customer service for details. We appreciate your cooperation as we manage the situation.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a um acidente rodoviário, os pontos de paragem nas linhas {line_short_name[]} foram temporariamente relocados enquanto este aviso estiver ativo. Por favor, siga a sinalização ou entre em contacto connosco para mais detalhes. Agradecemos a sua colaboração enquanto gerimos a situação.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to a road accident, the stop on the line {line_short_name} has been temporarily relocated while this notice is in effect. Please follow posted signage or contact our customer service for details. We appreciate your cooperation as we manage the situation.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a um acidente rodoviário, o ponto de paragem na linha {line_short_name} foi temporariamente relocado enquanto este aviso estiver ativo. Por favor, siga a sinalização ou entre em contacto connosco para mais detalhes. Agradecemos a sua colaboração enquanto gerimos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Stops temporarily relocated due to road accident' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Pontos de paragem temporariamente relocados devido a acidente rodoviário' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Stop temporarily relocated due to road accident' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Ponto de paragem temporariamente relocados devido a acidente rodoviário' },
			},
		},
	},

	'ACCIDENT:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: 'Due to a road accident, the rides {ride_short_name[]} are temporarily serving different stops while this notice is in effect. Please follow posted signage or contact our customer service for updated information. We thank you for your understanding as we manage the situation.' },
				pt: { placeholders: ['{ride_short_name[]}'], text: 'Devido a um acidente rodoviário, as viagens {ride_short_name[]} estão a utilizar paragens temporárias enquanto este aviso estiver ativo. Por favor, siga a sinalização ou entre em contacto connosco para informações atualizadas. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: 'Due to a road accident, the ride {ride_short_name} is temporarily serving a different stop while this notice is in effect. Please follow posted signage or contact our customer service for updated information. We thank you for your understanding as we manage the situation.' },
				pt: { placeholders: ['{ride_short_name}'], text: 'Devido a um acidente rodoviário, a viagem {ride_short_name} está a utilizar uma paragem temporária enquanto este aviso estiver ativo. Por favor, siga a sinalização ou entre em contacto connosco para informações atualizadas. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Stops temporarily moved due to road accident' },
				pt: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Paragens temporariamente alteradas devido a acidente rodoviário' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Stop temporarily moved due to road accident' },
				pt: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Paragem temporariamente alterada devido a acidente rodoviário' },
			},
		},
	},

	'ACCIDENT:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: 'Due to a road accident, the stops {stop_name[]} have been temporarily moved while this notice is in effect. Please follow posted signage or contact our customer service for updated information. We thank you for your understanding as we manage the situation.' },
				pt: { placeholders: ['{stop_name[]}'], text: 'Devido a um acidente rodoviário, as paragens {stop_name[]} foram temporariamente alteradas enquanto este aviso estiver ativo. Por favor, siga a sinalização ou entre em contacto connosco para informações atualizadas. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: 'Due to a road accident, the stop {stop_name} has been temporarily moved while this notice is in effect. Please follow posted signage or contact our customer service for updated information. We thank you for your understanding as we manage the situation.' },
				pt: { placeholders: ['{stop_name}'], text: 'Devido a um acidente rodoviário, a paragem {stop_name} foi temporariamente alterada enquanto este aviso estiver ativo. Por favor, siga a sinalização ou entre em contacto connosco para informações atualizadas. Agradecemos a sua compreensão enquanto gerimos a situação.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Stops temporarily moved due to road accident' },
				pt: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Paragens temporariamente alteradas devido a acidente rodoviário' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: '{stop_name} | Stop temporarily moved due to road accident' },
				pt: { placeholders: ['{stop_name}'], text: '{stop_name} | Paragem temporariamente alterada devido a acidente rodoviário' },
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

	'CONSTRUCTION:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Additional services have been added to the lines {line_short_name[]} due to ongoing construction. Please check updated schedules or contact our customer service for details. We thank you for your understanding during this period.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Foram adicionados serviços adicionais nas linhas {line_short_name[]} devido a obras em curso. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão durante este período.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Additional services have been added to the line {line_short_name} due to ongoing construction. Please check updated schedules or contact our customer service for details. We thank you for your understanding during this period.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Foi adicionado um serviço adicional na linha {line_short_name} devido a obras em curso. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão durante este período.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Additional service due to construction' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Serviço adicional devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Additional service due to construction' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Serviço adicional devido a obras de construção' },
			},
		},
	},

	'CONSTRUCTION:ADDITIONAL_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: 'Additional services have been added to the rides {ride_short_name[]} due to ongoing construction. Please check updated schedules or contact our customer service for details. We thank you for your understanding during this period.' },
				pt: { placeholders: ['{ride_short_name[]}'], text: 'Foram adicionados serviços adicionais nas viagens {ride_short_name[]} devido a obras em curso. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão durante este período.' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: 'An additional service has been added to the ride {ride_short_name} due to ongoing construction. Please check updated schedules or contact our customer service for details. We thank you for your understanding during this period.' },
				pt: { placeholders: ['{ride_short_name}'], text: 'Foi adicionado um serviço adicional na viagem {ride_short_name} devido a obras em curso. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão durante este período.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Additional service due to construction' },
				pt: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Serviço adicional devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Additional service due to construction' },
				pt: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Serviço adicional devido a obras de construção' },
			},
		},
	},

	'CONSTRUCTION:ADDITIONAL_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: 'Additional services have been added at the stops {stop_name[]} due to ongoing construction. Please check updated schedules or contact our customer service for details. We thank you for your understanding during this period.' },
				pt: { placeholders: ['{stop_name[]}'], text: 'Foram adicionados serviços adicionais nas paragens {stop_name[]} devido a obras em curso. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão durante este período.' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: 'An additional service has been added at the stop {stop_name} due to ongoing construction. Please check updated schedules or contact our customer service for details. We thank you for your understanding during this period.' },
				pt: { placeholders: ['{stop_name}'], text: 'Foi adicionado um serviço adicional na paragem {stop_name} devido a obras em curso. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão durante este período.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Additional service due to construction' },
				pt: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Serviço adicional devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: '{stop_name} | Additional service due to construction' },
				pt: { placeholders: ['{stop_name}'], text: '{stop_name} | Serviço adicional devido a obras de construção' },
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

	'CONSTRUCTION:MODIFIED_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to construction work, the service on the lines {line_short_name[]} has been modified. Please check updated schedules or contact our customer service for details. We appreciate your understanding while the works are completed.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido a obras de construção, o serviço nas linhas {line_short_name[]} foi modificado. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão enquanto as obras são concluídas.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to construction work, the service on the line {line_short_name} has been modified. Please check updated schedules or contact our customer service for details. We appreciate your understanding while the works are completed.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido a obras de construção, o serviço na linha {line_short_name} foi modificado. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão enquanto as obras são concluídas.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Service modified due to construction' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Serviço modificado devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Service modified due to construction' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Serviço modificado devido a obras de construção' },
			},
		},
	},

	'CONSTRUCTION:MODIFIED_SERVICE:rides': {
		description: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: 'Due to construction work, the rides {ride_short_name[]} have modified service. Please check updated schedules or contact our customer service for details. We appreciate your understanding while the works are completed.' },
				pt: { placeholders: ['{ride_short_name[]}'], text: 'Devido a obras de construção, as viagens {ride_short_name[]} têm serviço modificado. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão enquanto as obras são concluídas.' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: 'Due to construction work, the ride {ride_short_name} has modified service. Please check updated schedules or contact our customer service for details. We appreciate your understanding while the works are completed.' },
				pt: { placeholders: ['{ride_short_name}'], text: 'Devido a obras de construção, a viagem {ride_short_name} tem serviço modificado. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão enquanto as obras são concluídas.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Service modified due to construction' },
				pt: { placeholders: ['{ride_short_name[]}'], text: '{ride_short_name[]} | Serviço modificado devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Service modified due to construction' },
				pt: { placeholders: ['{ride_short_name}'], text: '{ride_short_name} | Serviço modificado devido a obras de construção' },
			},
		},
	},

	'CONSTRUCTION:MODIFIED_SERVICE:stops': {
		description: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: 'Due to construction work, service at the stops {stop_name[]} has been modified. Please check updated schedules or contact our customer service for details. We appreciate your understanding while the works are completed.' },
				pt: { placeholders: ['{stop_name[]}'], text: 'Devido a obras de construção, o serviço nas paragens {stop_name[]} foi modificado. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão enquanto as obras são concluídas.' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: 'Due to construction work, service at the stop {stop_name} has been modified. Please check updated schedules or contact our customer service for details. We appreciate your understanding while the works are completed.' },
				pt: { placeholders: ['{stop_name}'], text: 'Devido a obras de construção, o serviço na paragem {stop_name} foi modificado. Por favor, consulte os horários atualizados ou entre em contacto connosco para mais detalhes. Agradecemos a sua compreensão enquanto as obras são concluídas.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Service modified due to construction' },
				pt: { placeholders: ['{stop_name[]}'], text: '{stop_name[]} | Serviço modificado devido a obras de construção' },
			},
			singular: {
				en: { placeholders: ['{stop_name}'], text: '{stop_name} | Service modified due to construction' },
				pt: { placeholders: ['{stop_name}'], text: '{stop_name} | Serviço modificado devido a obras de construção' },
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

	'DEMONSTRATION:STOP_MOVED:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Due to ongoing demonstrations, the stops for the lines {line_short_name[]} have been temporarily relocated. Please follow local signage for updated stop locations.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Devido às manifestações em curso, as paragens das linhas {line_short_name[]} foram temporariamente realocadas. Por favor, siga a sinalização local para conhecer as novas localizações.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Due to ongoing demonstrations, the stop for the line {line_short_name} has been temporarily relocated. Please follow local signage for the updated stop location.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Devido às manifestações em curso, a paragem da linha {line_short_name} foi temporariamente realocada. Por favor, siga a sinalização local para conhecer a nova localização.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Stop relocated due to demonstrations' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Paragem realocada devido a manifestações' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Stop relocated due to demonstration' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Paragem realocada devido a manifestação' },
			},
		},
	},

	'DEMONSTRATION:STOP_MOVED:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Rides are affected by relocated stops due to demonstrations. Passengers should follow signage for the temporary stop locations.' },
				pt: { placeholders: [], text: 'As viagens estão afetadas por paragens realocadas devido a manifestações. Os passageiros devem seguir a sinalização para localizar as paragens temporárias.' },
			},
			singular: {
				en: { placeholders: [], text: 'This ride is affected by a relocated stop due to demonstration. Passengers should follow signage for the temporary stop location.' },
				pt: { placeholders: [], text: 'Esta viagem está afetada por uma paragem realocada devido a manifestação. Os passageiros devem seguir a sinalização para localizar a paragem temporária.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Rides | Stops relocated due to demonstrations' },
				pt: { placeholders: [], text: 'Viagens | Paragens realocadas devido a manifestações' },
			},
			singular: {
				en: { placeholders: [], text: 'Ride | Stop relocated due to demonstration' },
				pt: { placeholders: [], text: 'Viagem | Paragem realocada devido a manifestação' },
			},
		},
	},

	'DEMONSTRATION:STOP_MOVED:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Multiple stops have been temporarily moved due to ongoing demonstrations. Passengers are advised to follow local signage for new locations.' },
				pt: { placeholders: [], text: 'Várias paragens foram temporariamente deslocadas devido às manifestações em curso. Recomenda-se que os passageiros sigam a sinalização local para as novas localizações.' },
			},
			singular: {
				en: { placeholders: [], text: 'This stop has been temporarily moved due to ongoing demonstrations. Passengers are advised to follow local signage for the new location.' },
				pt: { placeholders: [], text: 'Esta paragem foi temporariamente deslocada devido às manifestações em curso. Recomenda-se que os passageiros sigam a sinalização local para a nova localização.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Multiple Stops | Temporarily moved due to demonstrations' },
				pt: { placeholders: [], text: 'Várias Paragens | Temporariamente deslocadas devido a manifestações' },
			},
			singular: {
				en: { placeholders: [], text: 'Stop | Temporarily moved due to demonstration' },
				pt: { placeholders: [], text: 'Paragem | Temporariamente deslocada devido a manifestação' },
			},
		},
	},

	'DRIVER_ABSENCE:ACCESSIBILITY_ISSUE:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Service on lines {line_short_name[]} may be affected due to driver absences impacting accessibility. Passengers requiring assistance are advised to contact customer service.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'O serviço nas linhas {line_short_name[]} pode ser afetado devido à ausência de condutores, impactando a acessibilidade. Passageiros que necessitem de assistência devem contactar o serviço de apoio ao cliente.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Service on line {line_short_name} may be affected due to driver absence impacting accessibility. Passengers requiring assistance are advised to contact customer service.' },
				pt: { placeholders: ['{line_short_name}'], text: 'O serviço na linha {line_short_name} pode ser afetado devido à ausência de condutor, impactando a acessibilidade. Passageiros que necessitem de assistência devem contactar o serviço de apoio ao cliente.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Service affected due to driver absence' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Serviço afetado devido à ausência de condutor' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Service affected due to driver absence' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Serviço afetado devido à ausência de condutor' },
			},
		},
	},

	'DRIVER_ABSENCE:ACCESSIBILITY_ISSUE:rides': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Rides may experience disruptions due to driver absences affecting accessibility. Passengers needing assistance should contact customer service.' },
				pt: { placeholders: [], text: 'As viagens podem sofrer interrupções devido à ausência de condutores que afeta a acessibilidade. Passageiros que necessitem de assistência devem contactar o serviço de apoio ao cliente.' },
			},
			singular: {
				en: { placeholders: [], text: 'This ride may experience disruption due to driver absence affecting accessibility. Passengers needing assistance should contact customer service.' },
				pt: { placeholders: [], text: 'Esta viagem pode sofrer interrupções devido à ausência de condutor que afeta a acessibilidade. Passageiros que necessitem de assistência devem contactar o serviço de apoio ao cliente.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Rides | Disrupted due to driver absence' },
				pt: { placeholders: [], text: 'Viagens | Interrupções devido à ausência de condutor' },
			},
			singular: {
				en: { placeholders: [], text: 'Ride | Disrupted due to driver absence' },
				pt: { placeholders: [], text: 'Viagem | Interrupção devido à ausência de condutor' },
			},
		},
	},

	'DRIVER_ABSENCE:ACCESSIBILITY_ISSUE:stops': {
		description: {
			plural: {
				en: { placeholders: [], text: 'Stops may be impacted by driver absences affecting accessibility. Passengers requiring assistance should check with customer service.' },
				pt: { placeholders: [], text: 'As paragens podem ser afetadas pela ausência de condutores que impacta a acessibilidade. Passageiros que necessitem de assistência devem contactar o serviço de apoio ao cliente.' },
			},
			singular: {
				en: { placeholders: [], text: 'This stop may be impacted by driver absence affecting accessibility. Passengers requiring assistance should check with customer service.' },
				pt: { placeholders: [], text: 'Esta paragem pode ser afetada pela ausência de condutor que impacta a acessibilidade. Passageiros que necessitem de assistência devem contactar o serviço de apoio ao cliente.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: [], text: 'Stops | Impacted due to driver absence' },
				pt: { placeholders: [], text: 'Paragens | Afetadas devido à ausência de condutor' },
			},
			singular: {
				en: { placeholders: [], text: 'Stop | Impacted due to driver absence' },
				pt: { placeholders: [], text: 'Paragem | Afetada devido à ausência de condutor' },
			},
		},
	},

	'DRIVER_ABSENCE:ADDITIONAL_SERVICE:lines': {
		description: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: 'Additional service is being provided on lines {line_short_name[]} due to driver absences. Passengers may experience adjusted schedules.' },
				pt: { placeholders: ['{line_short_name[]}'], text: 'Está a ser prestado serviço adicional nas linhas {line_short_name[]} devido à ausência de condutores. Os passageiros podem experienciar horários ajustados.' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: 'Additional service is being provided on line {line_short_name} due to driver absence. Passengers may experience adjusted schedules.' },
				pt: { placeholders: ['{line_short_name}'], text: 'Está a ser prestado serviço adicional na linha {line_short_name} devido à ausência de condutor. Os passageiros podem experienciar horários ajustados.' },
			},
		},
		title: {
			plural: {
				en: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Additional service due to driver absence' },
				pt: { placeholders: ['{line_short_name[]}'], text: '{line_short_name[]} | Serviço adicional devido à ausência de condutor' },
			},
			singular: {
				en: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Additional service due to driver absence' },
				pt: { placeholders: ['{line_short_name}'], text: '{line_short_name} | Serviço adicional devido à ausência de condutor' },
			},
		},
	},

	'DRIVER_ABSENCE:ADDITIONAL_SERVICE:rides': {
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

	'DRIVER_ABSENCE:ADDITIONAL_SERVICE:stops': {
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

	'DRIVER_ABSENCE:DETOUR:lines': {
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

	'DRIVER_ABSENCE:DETOUR:rides': {
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

	'DRIVER_ABSENCE:DETOUR:stops': {
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

	'DRIVER_ABSENCE:MODIFIED_SERVICE:lines': {
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

	'DRIVER_ABSENCE:MODIFIED_SERVICE:rides': {
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

	'DRIVER_ABSENCE:MODIFIED_SERVICE:stops': {
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

	'DRIVER_ABSENCE:NO_SERVICE:lines': {
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

	'DRIVER_ABSENCE:NO_SERVICE:rides': {
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

	'DRIVER_ABSENCE:NO_SERVICE:stops': {
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

	'DRIVER_ABSENCE:REDUCED_SERVICE:lines': {
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

	'DRIVER_ABSENCE:REDUCED_SERVICE:rides': {
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

	'DRIVER_ABSENCE:REDUCED_SERVICE:stops': {
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

	'DRIVER_ABSENCE:SIGNIFICANT_DELAYS:lines': {
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

	'DRIVER_ABSENCE:SIGNIFICANT_DELAYS:rides': {
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

	'DRIVER_ABSENCE:SIGNIFICANT_DELAYS:stops': {
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

	'DRIVER_ABSENCE:STOP_MOVED:lines': {
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

	'DRIVER_ABSENCE:STOP_MOVED:rides': {
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

	'DRIVER_ABSENCE:STOP_MOVED:stops': {
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

	'DRIVER_ISSUE:ACCESSIBILITY_ISSUE:lines': {
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

	'DRIVER_ISSUE:ACCESSIBILITY_ISSUE:rides': {
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

	'DRIVER_ISSUE:ACCESSIBILITY_ISSUE:stops': {
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

	'DRIVER_ISSUE:ADDITIONAL_SERVICE:lines': {
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

	'DRIVER_ISSUE:ADDITIONAL_SERVICE:rides': {
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

	'DRIVER_ISSUE:ADDITIONAL_SERVICE:stops': {
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

	'DRIVER_ISSUE:DETOUR:lines': {
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

	'DRIVER_ISSUE:DETOUR:rides': {
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

	'DRIVER_ISSUE:DETOUR:stops': {
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

	'DRIVER_ISSUE:MODIFIED_SERVICE:lines': {
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

	'DRIVER_ISSUE:MODIFIED_SERVICE:rides': {
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

	'DRIVER_ISSUE:MODIFIED_SERVICE:stops': {
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

	'DRIVER_ISSUE:NO_SERVICE:stops': {
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

	'DRIVER_ISSUE:REDUCED_SERVICE:lines': {
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

	'DRIVER_ISSUE:REDUCED_SERVICE:rides': {
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

	'DRIVER_ISSUE:REDUCED_SERVICE:stops': {
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

	'DRIVER_ISSUE:SIGNIFICANT_DELAYS:lines': {
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

	'DRIVER_ISSUE:SIGNIFICANT_DELAYS:rides': {
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

	'DRIVER_ISSUE:SIGNIFICANT_DELAYS:stops': {
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

	'DRIVER_ISSUE:STOP_MOVED:lines': {
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

	'DRIVER_ISSUE:STOP_MOVED:rides': {
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

	'DRIVER_ISSUE:STOP_MOVED:stops': {
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

	'HIGH_PASSENGER_LOAD:ACCESSIBILITY_ISSUE:lines': {
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

	'HIGH_PASSENGER_LOAD:DETOUR:lines': {
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

	'HIGH_PASSENGER_LOAD:DETOUR:rides': {
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

	'HIGH_PASSENGER_LOAD:DETOUR:stops': {
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

	'HIGH_PASSENGER_LOAD:MODIFIED_SERVICE:lines': {
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

	'HIGH_PASSENGER_LOAD:MODIFIED_SERVICE:rides': {
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

	'HIGH_PASSENGER_LOAD:MODIFIED_SERVICE:stops': {
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

	'HIGH_PASSENGER_LOAD:NO_SERVICE:lines': {
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

	'HIGH_PASSENGER_LOAD:NO_SERVICE:rides': {
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

	'HIGH_PASSENGER_LOAD:NO_SERVICE:stops': {
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

	'HIGH_PASSENGER_LOAD:REDUCED_SERVICE:lines': {
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

	'HIGH_PASSENGER_LOAD:REDUCED_SERVICE:rides': {
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

	'HIGH_PASSENGER_LOAD:REDUCED_SERVICE:stops': {
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

	'HIGH_PASSENGER_LOAD:STOP_MOVED:lines': {
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

	'HIGH_PASSENGER_LOAD:STOP_MOVED:rides': {
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

	'HIGH_PASSENGER_LOAD:STOP_MOVED:stops': {
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

	'HOLIDAY:ACCESSIBILITY_ISSUE:lines': {
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

	'HOLIDAY:ACCESSIBILITY_ISSUE:rides': {
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

	'HOLIDAY:ACCESSIBILITY_ISSUE:stops': {
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

	'HOLIDAY:ADDITIONAL_SERVICE:lines': {
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

	'HOLIDAY:ADDITIONAL_SERVICE:rides': {
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

	'HOLIDAY:ADDITIONAL_SERVICE:stops': {
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

	'HOLIDAY:DETOUR:lines': {
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

	'HOLIDAY:DETOUR:rides': {
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

	'HOLIDAY:DETOUR:stops': {
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

	'HOLIDAY:MODIFIED_SERVICE:lines': {
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

	'HOLIDAY:MODIFIED_SERVICE:rides': {
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

	'HOLIDAY:MODIFIED_SERVICE:stops': {
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

	'HOLIDAY:NO_SERVICE:lines': {
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

	'HOLIDAY:NO_SERVICE:rides': {
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

	'HOLIDAY:NO_SERVICE:stops': {
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

	'HOLIDAY:REDUCED_SERVICE:lines': {
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

	'HOLIDAY:REDUCED_SERVICE:rides': {
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

	'HOLIDAY:REDUCED_SERVICE:stops': {
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

	'HOLIDAY:SIGNIFICANT_DELAYS:lines': {
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

	'HOLIDAY:SIGNIFICANT_DELAYS:rides': {
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

	'HOLIDAY:SIGNIFICANT_DELAYS:stops': {
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

	'HOLIDAY:STOP_MOVED:lines': {
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

	'HOLIDAY:STOP_MOVED:rides': {
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

	'HOLIDAY:STOP_MOVED:stops': {
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

	'MAINTENANCE:ACCESSIBILITY_ISSUE:lines': {
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

	'MAINTENANCE:ACCESSIBILITY_ISSUE:rides': {
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

	'MAINTENANCE:ACCESSIBILITY_ISSUE:stops': {
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

	'MAINTENANCE:ADDITIONAL_SERVICE:lines': {
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

	'MAINTENANCE:ADDITIONAL_SERVICE:rides': {
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

	'MAINTENANCE:ADDITIONAL_SERVICE:stops': {
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

	'MAINTENANCE:DETOUR:lines': {
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

	'MAINTENANCE:DETOUR:rides': {
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

	'MAINTENANCE:DETOUR:stops': {
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

	'MAINTENANCE:MODIFIED_SERVICE:lines': {
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

	'MAINTENANCE:MODIFIED_SERVICE:rides': {
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

	'MAINTENANCE:MODIFIED_SERVICE:stops': {
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

	'MAINTENANCE:NO_SERVICE:lines': {
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

	'MAINTENANCE:NO_SERVICE:rides': {
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

	'MAINTENANCE:NO_SERVICE:stops': {
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

	'MAINTENANCE:REDUCED_SERVICE:lines': {
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

	'MAINTENANCE:REDUCED_SERVICE:rides': {
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

	'MAINTENANCE:REDUCED_SERVICE:stops': {
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

	'MAINTENANCE:SIGNIFICANT_DELAYS:lines': {
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

	'MAINTENANCE:SIGNIFICANT_DELAYS:rides': {
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

	'MAINTENANCE:SIGNIFICANT_DELAYS:stops': {
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

	'MAINTENANCE:STOP_MOVED:lines': {
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

	'MAINTENANCE:STOP_MOVED:rides': {
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

	'MAINTENANCE:STOP_MOVED:stops': {
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

	'MEDICAL_EMERGENCY:ACCESSIBILITY_ISSUE:lines': {
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

	'MEDICAL_EMERGENCY:ACCESSIBILITY_ISSUE:rides': {
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

	'MEDICAL_EMERGENCY:ACCESSIBILITY_ISSUE:stops': {
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

	'MEDICAL_EMERGENCY:ADDITIONAL_SERVICE:lines': {
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

	'MEDICAL_EMERGENCY:ADDITIONAL_SERVICE:rides': {
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

	'MEDICAL_EMERGENCY:ADDITIONAL_SERVICE:stops': {
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

	'MEDICAL_EMERGENCY:MODIFIED_SERVICE:lines': {
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

	'MEDICAL_EMERGENCY:MODIFIED_SERVICE:rides': {
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

	'MEDICAL_EMERGENCY:MODIFIED_SERVICE:stops': {
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

	'MEDICAL_EMERGENCY:STOP_MOVED:lines': {
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

	'MEDICAL_EMERGENCY:STOP_MOVED:rides': {
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

	'MEDICAL_EMERGENCY:STOP_MOVED:stops': {
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

	'POLICE_ACTIVITY:ACCESSIBILITY_ISSUE:lines': {
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

	'POLICE_ACTIVITY:ACCESSIBILITY_ISSUE:rides': {
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

	'POLICE_ACTIVITY:ACCESSIBILITY_ISSUE:stops': {
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

	'POLICE_ACTIVITY:ADDITIONAL_SERVICE:lines': {
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

	'POLICE_ACTIVITY:ADDITIONAL_SERVICE:rides': {
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

	'POLICE_ACTIVITY:ADDITIONAL_SERVICE:stops': {
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

	'POLICE_ACTIVITY:MODIFIED_SERVICE:lines': {
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

	'POLICE_ACTIVITY:MODIFIED_SERVICE:rides': {
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

	'POLICE_ACTIVITY:MODIFIED_SERVICE:stops': {
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

	'POLICE_ACTIVITY:STOP_MOVED:lines': {
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

	'POLICE_ACTIVITY:STOP_MOVED:rides': {
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

	'POLICE_ACTIVITY:STOP_MOVED:stops': {
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

	'ROAD_INCIDENT:ACCESSIBILITY_ISSUE:lines': {
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

	'ROAD_INCIDENT:ACCESSIBILITY_ISSUE:rides': {
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

	'ROAD_INCIDENT:ACCESSIBILITY_ISSUE:stops': {
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

	'ROAD_INCIDENT:ADDITIONAL_SERVICE:lines': {
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

	'ROAD_INCIDENT:ADDITIONAL_SERVICE:rides': {
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

	'ROAD_INCIDENT:ADDITIONAL_SERVICE:stops': {
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

	'ROAD_INCIDENT:DETOUR:lines': {
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

	'ROAD_INCIDENT:DETOUR:rides': {
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

	'ROAD_INCIDENT:DETOUR:stops': {
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

	'ROAD_INCIDENT:MODIFIED_SERVICE:lines': {
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

	'ROAD_INCIDENT:MODIFIED_SERVICE:rides': {
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

	'ROAD_INCIDENT:MODIFIED_SERVICE:stops': {
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

	'ROAD_INCIDENT:NO_SERVICE:lines': {
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

	'ROAD_INCIDENT:NO_SERVICE:rides': {
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

	'ROAD_INCIDENT:NO_SERVICE:stops': {
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

	'ROAD_INCIDENT:REDUCED_SERVICE:lines': {
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

	'ROAD_INCIDENT:REDUCED_SERVICE:rides': {
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

	'ROAD_INCIDENT:REDUCED_SERVICE:stops': {
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

	'ROAD_INCIDENT:SIGNIFICANT_DELAYS:lines': {
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

	'ROAD_INCIDENT:SIGNIFICANT_DELAYS:rides': {
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

	'ROAD_INCIDENT:SIGNIFICANT_DELAYS:stops': {
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

	'ROAD_INCIDENT:STOP_MOVED:lines': {
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

	'ROAD_INCIDENT:STOP_MOVED:rides': {
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

	'ROAD_INCIDENT:STOP_MOVED:stops': {
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

	'STRIKE:ACCESSIBILITY_ISSUE:lines': {
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

	'STRIKE:ACCESSIBILITY_ISSUE:rides': {
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

	'STRIKE:ACCESSIBILITY_ISSUE:stops': {
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

	'STRIKE:MODIFIED_SERVICE:lines': {
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

	'STRIKE:MODIFIED_SERVICE:rides': {
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

	'STRIKE:MODIFIED_SERVICE:stops': {
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

	'STRIKE:STOP_MOVED:lines': {
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

	'STRIKE:STOP_MOVED:rides': {
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

	'STRIKE:STOP_MOVED:stops': {
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

	'SYSTEM_FAILURE:ACCESSIBILITY_ISSUE:lines': {
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

	'SYSTEM_FAILURE:ACCESSIBILITY_ISSUE:rides': {
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

	'SYSTEM_FAILURE:ACCESSIBILITY_ISSUE:stops': {
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

	'SYSTEM_FAILURE:ADDITIONAL_SERVICE:lines': {
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

	'SYSTEM_FAILURE:ADDITIONAL_SERVICE:rides': {
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

	'SYSTEM_FAILURE:ADDITIONAL_SERVICE:stops': {
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

	'SYSTEM_FAILURE:DETOUR:lines': {
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

	'SYSTEM_FAILURE:DETOUR:rides': {
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

	'SYSTEM_FAILURE:DETOUR:stops': {
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

	'SYSTEM_FAILURE:MODIFIED_SERVICE:lines': {
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

	'SYSTEM_FAILURE:MODIFIED_SERVICE:rides': {
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

	'SYSTEM_FAILURE:MODIFIED_SERVICE:stops': {
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

	'SYSTEM_FAILURE:NO_SERVICE:lines': {
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

	'SYSTEM_FAILURE:NO_SERVICE:rides': {
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

	'SYSTEM_FAILURE:NO_SERVICE:stops': {
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

	'SYSTEM_FAILURE:REDUCED_SERVICE:lines': {
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

	'SYSTEM_FAILURE:REDUCED_SERVICE:rides': {
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

	'SYSTEM_FAILURE:REDUCED_SERVICE:stops': {
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

	'SYSTEM_FAILURE:SIGNIFICANT_DELAYS:lines': {
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

	'SYSTEM_FAILURE:SIGNIFICANT_DELAYS:rides': {
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

	'SYSTEM_FAILURE:SIGNIFICANT_DELAYS:stops': {
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

	'SYSTEM_FAILURE:STOP_MOVED:lines': {
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

	'SYSTEM_FAILURE:STOP_MOVED:rides': {
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

	'SYSTEM_FAILURE:STOP_MOVED:stops': {
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

	'TECHNICAL_PROBLEM:ACCESSIBILITY_ISSUE:lines': {
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

	'TECHNICAL_PROBLEM:ACCESSIBILITY_ISSUE:rides': {
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

	'TECHNICAL_PROBLEM:ACCESSIBILITY_ISSUE:stops': {
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

	'TECHNICAL_PROBLEM:ADDITIONAL_SERVICE:lines': {
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

	'TECHNICAL_PROBLEM:ADDITIONAL_SERVICE:rides': {
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

	'TECHNICAL_PROBLEM:ADDITIONAL_SERVICE:stops': {
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

	'TECHNICAL_PROBLEM:DETOUR:lines': {
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

	'TECHNICAL_PROBLEM:DETOUR:rides': {
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

	'TECHNICAL_PROBLEM:DETOUR:stops': {
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

	'TECHNICAL_PROBLEM:MODIFIED_SERVICE:lines': {
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

	'TECHNICAL_PROBLEM:MODIFIED_SERVICE:rides': {
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

	'TECHNICAL_PROBLEM:MODIFIED_SERVICE:stops': {
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

	'TECHNICAL_PROBLEM:NO_SERVICE:lines': {
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

	'TECHNICAL_PROBLEM:NO_SERVICE:rides': {
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

	'TECHNICAL_PROBLEM:NO_SERVICE:stops': {
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

	'TECHNICAL_PROBLEM:REDUCED_SERVICE:lines': {
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

	'TECHNICAL_PROBLEM:REDUCED_SERVICE:rides': {
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

	'TECHNICAL_PROBLEM:REDUCED_SERVICE:stops': {
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

	'TECHNICAL_PROBLEM:SIGNIFICANT_DELAYS:lines': {
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

	'TECHNICAL_PROBLEM:SIGNIFICANT_DELAYS:rides': {
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

	'TECHNICAL_PROBLEM:SIGNIFICANT_DELAYS:stops': {
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

	'TECHNICAL_PROBLEM:STOP_MOVED:lines': {
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

	'TECHNICAL_PROBLEM:STOP_MOVED:rides': {
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

	'TECHNICAL_PROBLEM:STOP_MOVED:stops': {
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

	'TRAFFIC_JAM:ACCESSIBILITY_ISSUE:lines': {
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

	'TRAFFIC_JAM:ACCESSIBILITY_ISSUE:rides': {
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

	'TRAFFIC_JAM:ACCESSIBILITY_ISSUE:stops': {
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

	'TRAFFIC_JAM:ADDITIONAL_SERVICE:lines': {
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

	'TRAFFIC_JAM:ADDITIONAL_SERVICE:rides': {
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

	'TRAFFIC_JAM:ADDITIONAL_SERVICE:stops': {
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

	'TRAFFIC_JAM:MODIFIED_SERVICE:lines': {
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

	'TRAFFIC_JAM:MODIFIED_SERVICE:rides': {
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

	'TRAFFIC_JAM:MODIFIED_SERVICE:stops': {
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

	'TRAFFIC_JAM:STOP_MOVED:lines': {
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

	'TRAFFIC_JAM:STOP_MOVED:rides': {
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

	'TRAFFIC_JAM:STOP_MOVED:stops': {
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

	'VEHICLE_ISSUE:ACCESSIBILITY_ISSUE:lines': {
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

	'VEHICLE_ISSUE:ACCESSIBILITY_ISSUE:rides': {
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

	'VEHICLE_ISSUE:ACCESSIBILITY_ISSUE:stops': {
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

	'VEHICLE_ISSUE:ADDITIONAL_SERVICE:lines': {
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

	'VEHICLE_ISSUE:ADDITIONAL_SERVICE:rides': {
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

	'VEHICLE_ISSUE:ADDITIONAL_SERVICE:stops': {
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

	'VEHICLE_ISSUE:DETOUR:lines': {
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

	'VEHICLE_ISSUE:DETOUR:rides': {
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

	'VEHICLE_ISSUE:DETOUR:stops': {
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

	'VEHICLE_ISSUE:MODIFIED_SERVICE:lines': {
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

	'VEHICLE_ISSUE:MODIFIED_SERVICE:rides': {
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

	'VEHICLE_ISSUE:MODIFIED_SERVICE:stops': {
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

	'VEHICLE_ISSUE:NO_SERVICE:lines': {
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

	'VEHICLE_ISSUE:NO_SERVICE:rides': {
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

	'VEHICLE_ISSUE:NO_SERVICE:stops': {
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

	'VEHICLE_ISSUE:REDUCED_SERVICE:lines': {
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

	'VEHICLE_ISSUE:REDUCED_SERVICE:rides': {
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

	'VEHICLE_ISSUE:REDUCED_SERVICE:stops': {
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

	'VEHICLE_ISSUE:SIGNIFICANT_DELAYS:lines': {
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

	'VEHICLE_ISSUE:SIGNIFICANT_DELAYS:rides': {
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

	'VEHICLE_ISSUE:SIGNIFICANT_DELAYS:stops': {
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

	'VEHICLE_ISSUE:STOP_MOVED:lines': {
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

	'VEHICLE_ISSUE:STOP_MOVED:rides': {
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

	'VEHICLE_ISSUE:STOP_MOVED:stops': {
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

	'WEATHER:ADDITIONAL_SERVICE:lines': {
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

	'WEATHER:ADDITIONAL_SERVICE:rides': {
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

	'WEATHER:ADDITIONAL_SERVICE:stops': {
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

	'WEATHER:MODIFIED_SERVICE:lines': {
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

	'WEATHER:MODIFIED_SERVICE:rides': {
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

	'WEATHER:MODIFIED_SERVICE:stops': {
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

	'WEATHER:STOP_MOVED:lines': {
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

	'WEATHER:STOP_MOVED:rides': {
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

	'WEATHER:STOP_MOVED:stops': {
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
