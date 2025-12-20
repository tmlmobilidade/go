import { AlertType, GtfsCause, GtfsEffect, PublishStatus } from '@tmlmobilidade/types';

export const Translations: { ALERT_TYPE: Record<AlertType, string>, CAUSE: Record<GtfsCause, string>, EFFECT: Record<GtfsEffect, string>, PUBLISH_STATUS: Record<PublishStatus, string> } = {
	ALERT_TYPE: {
		realtime: 'Alerta Tempo Real',
		scheduled: 'Alerta Planeado',
	},
	CAUSE: {
		ACCIDENT: 'Acidente',
		CONSTRUCTION: 'Obras',
		DEMONSTRATION: 'Evento / Manifestação',
		DRIVER_ABSENCE: 'Condutor Ausente',
		DRIVER_ISSUE: 'Condutor com Problema',
		HIGH_PASSENGER_LOAD: 'Elevado Volume de Passageiros',
		HOLIDAY: 'Feriado',
		MAINTENANCE: 'Manutenção',
		MEDICAL_EMERGENCY: 'Emergência Médica',
		OTHER_CAUSE: 'Outras Causas',
		POLICE_ACTIVITY: 'Atividade Policial',
		ROAD_INCIDENT: 'Incidente na Estrada',
		STRIKE: 'Greve',
		SYSTEM_FAILURE: 'Falha do Sistema',
		TECHNICAL_PROBLEM: 'Problema Técnico',
		TRAFFIC_JAM: 'Congestão de Trânsito',
		UNKNOWN_CAUSE: 'Causa Desconhecida',
		VEHICLE_ISSUE: 'Veículo com Problema',
		WEATHER: 'Mau Tempo',
	},
	EFFECT: {
		ACCESSIBILITY_ISSUE: 'Impacto na Acessibilidade',
		ADDITIONAL_SERVICE: 'Aumento de Serviço',
		DETOUR: 'Desvio',
		MODIFIED_SERVICE: 'Alteração de Horários',
		NO_EFFECT: 'Sem Efeito',
		NO_SERVICE: 'Serviço Cancelado',
		OTHER_EFFECT: 'Outro',
		REDUCED_SERVICE: 'Serviço Reduzido',
		SIGNIFICANT_DELAYS: 'Atrasos Significativos',
		STOP_MOVED: 'Paragem Deslocada',
		UNKNOWN_EFFECT: 'Desconhecido',
	},
	PUBLISH_STATUS: {
		archived: 'Arquivado',
		draft: 'Rascunho',
		published: 'Publicado',
	},
};

export const CauseEffectPairingDefaultAlert = {
	ACCIDENT: {
		ACCESSIBILITY_ISSUE: {
			message: 'Devido a uma acidente, as linhas {lines}  poderão sofrer um impacto na acessibildiade. Os passageiros com mobilidade reduzida deverão contactar a linha de apoio.',
			title: '{lines} | Impacto na Acessibilidade - Acidente',
		},
		ADDITIONAL_SERVICE: {
			message: 'Devido a um acidente, as linhas {lines} terão o seu serviço reforçado de modo a minimizar o impacto nos passageiros.',
			title: '{lines} | Serviço Adicional - Acidente',
		},
		DETOUR: {
			message: 'Devido a um acidente, as linhas {lines} farão desvio de percurso.',
			title: '{lines} | Desvio de Percurso - Acidente',
		},
		MODIFIED_SERVICE: {
			message: 'Devido a um acidente, as  linhas {lines}  terão o seu serviço modificado.',
			title: '{lines} | Serviço Modificado - Acidente',
		},
		NO_EFFECT: {
			message: 'Apesar do acidente nesta zona, as linhas {lines}  mantêm o funcionamento normal.',
			title: '{lines} | Funcionamento Normal - Acidente',
		},
		NO_SERVICE: {
			message: 'Devido a um acidente, as linhas {lines} encontram-se temporariamente suspensas. Os passageiros deverão recorrer a percursos alternativos. Consulte o site ou a app Carris Metropolitana.',
			title: '{lines} | Serviço Suspenso - Acidente',
		},
		OTHER_EFFECT: {
			message: 'Devido a um acidente, as linhas {lines} poderão sofrer condicionamentos de trânsito.',
			title: '{lines} | Perturbação no Serviço - Acidente',
		},
		REDUCED_SERVICE: {
			message: 'Devido a um acidente, as  linhas {lines}  terão o seu serviço reduzido.',
			title: '{lines} | Serviço Reduzido - Acidente',
		},
		SIGNIFICANT_DELAYS: {
			message: 'Devido a um acidente, as linhas {lines} poderão sofrer atrasos significativos. Pedimos a compreensão de todos.',
			title: '{lines} | Atrasos Significativos - Acidente',
		},
		STOP_MOVED: {
			message: 'Devido a um acidente, a paragem das linhas {lines} foi temporariamente relocalizada.',
			title: '{lines} | Paragem Relocalizada - Acidente',
		},
		UNKNOWN_EFFECT: {
			message: 'Devido a um acidente, as linhas {lines} poderão sofrer condicionamentos de trânsito.',
			title: '{lines} | Impacto Incerto - Acidente',
		},
	},
	CONSTRUCTION: {
		ACCESSIBILITY_ISSUE: {
			message: 'Devido a obras, as linhas {lines}  poderão sofrer um impacto na acessibildiade. Os passageiros com mobilidade reduzida deverão contactar a linha de apoio.',
			title: '{lines} | Impacto na Acessibilidade - Obras',
		},
		ADDITIONAL_SERVICE: {
			message: 'Durante as obras, serão implementados horários adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional - Obras',
		},
		DETOUR: {
			message: 'Devido a obras, as linhas {lines} efetuarão desvio de percurso por {detour}.',
			title: '{lines} | Desvio de Percurso - Obras',
		},
		MODIFIED_SERVICE: {
			message: 'Devido a obras, as linhas {lines} terão alterações de horário.',
			title: '{lines} | Serviço Modificado - Obras',
		},
		NO_EFFECT: {
			message: 'Apesar das obras, as linhas {lines}  mantêm o funcionamento normal.',
			title: '{lines} | Funcionamento Normal - Obras',
		},
		NO_SERVICE: {
			message: 'Devido a obras, as linhas {lines} encontram-se temporariamente suspensas.',
			title: '{lines} | Serviço Suspenso - Obras',
		},
		OTHER_EFFECT: {
			message: 'Devido a obras, as linhas {lines} poderão sofrer condicionamentos de trânsito.',
			title: '{lines} | Perturbação no Serviço - Obras',
		},
		REDUCED_SERVICE: {
			message: 'Devido a obras, as linhas {lines} terão o seu serviço reduzido.',
			title: '{lines} | Serviço Reduzido - Obras',
		},
		SIGNIFICANT_DELAYS: {
			message: 'Devido a obras, as linhas {lines} poderão sofrer atrasos significativos.',
			title: '{lines} | Atrasos Significativos - Obras',
		},
		STOP_MOVED: {
			message: 'Devido a obras, a paragem das linhas {lines} foi temporariamente relocalizada.',
			title: '{lines} | Paragem Relocalizada - Obras',
		},
		UNKNOWN_EFFECT: {
			message: 'Devido a obras, o funcionamento das linhas {lines} poderá ser afetado.',
			title: '{lines} | Impacto Incerto - Obras',
		},
	},
	DEMONSTRATION: {
		ACCESSIBILITY_ISSUE: {
			message: 'Devido a uma manifestação, as linhas {lines}  poderão sofrer um impacto na acessibildiade. Os passageiros com mobilidade reduzida deverão contactar a linha de apoio.',
			title: '{lines} | Impacto na Acessibilidade - Manifestação',
		},
		ADDITIONAL_SERVICE: {
			message: 'Devido a uma manifestação, serão implementados horários adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional - Manifestação',
		},
		DETOUR: {
			message: 'Devido a uma manifestação, as linhas {lines} efetuarão desvio de percurso.',
			title: '{lines} | Desvio de Percurso - Manifestação',
		},
		MODIFIED_SERVICE: {
			message: 'Devido a uma manifestação, as linhas {lines} terão o seu serviço modificado.',
			title: '{lines} | Serviço Modificado - Manifestação',
		},
		NO_EFFECT: {
			message: 'Apesar da manifestação nesta zona, as linhas {lines} mantêm o funcionamento normal.',
			title: '{lines} | Sem Impacto no Serviço - Manifestação',
		},
		NO_SERVICE: {
			message: 'Devido a uma manifestação, as linhas {lines} encontram-se temporariamente suspensas. Pedimos a compreensão de todos.',
			title: '{lines} | Serviço Suspenso - Manifestação',
		},
		OTHER_EFFECT: {
			message: 'Devido a uma manifestação, as linhas {lines} poderão sofrer condicionamentos de trânsito.',
			title: '{lines} | Perturbação no Serviço - Manifestação',
		},
		REDUCED_SERVICE: {
			message: 'Devido a uma manifestação, as linhas {lines} terão o seu serviço reduzido.',
			title: '{lines} | Serviço Reduzido - Manifestação',
		},
		SIGNIFICANT_DELAYS: {
			message: 'Devido a uma manifestação, as linhas {lines} poderão sofrer atrasos significativos. Pedimos a compreensão de todos.',
			title: '{lines} | Atrasos Significativos - Manifestação',
		},
		STOP_MOVED: {
			message: 'Devido a uma manifestação, a paragem das linhas {lines} foi temporariamente relocalizada.',
			title: '{lines} | Paragem Relocalizada - Manifestação',
		},
		UNKNOWN_EFFECT: {
			message: 'Devido a uma manifestação, o funcionamento das linhas {lines} poderá ser afetado.',
			title: '{lines} | Impacto Incerto - Manifestação',
		},
	},
	DRIVER_ABSENCE: {
		ACCESSIBILITY_ISSUE: {
			message: 'Devido à ausência de motoristas, as linhas {lines} poderão sofrer um impacto na acessibilidade. Os passageiros com mobilidade reduzida deverão contactar a linha de apoio.',
			title: '{lines} | Impacto na Acessibilidade - Ausência de Motoristas',
		},
		ADDITIONAL_SERVICE: {
			message: 'Devido à ausência de motoristas, foram implementados serviços adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional - Ausência de Motoristas',
		},
		DETOUR: {
			message: 'Devido à ausência de motoristas, as linhas {lines} realizam desvio de percurso.',
			title: '{lines} | Desvio de Percurso - Ausência de Motoristas',
		},
		MODIFIED_SERVICE: {
			message: 'Devido à ausência de motoristas, o serviço das linhas {lines} foi temporariamente modificado.',
			title: '{lines} | Serviço Modificado - Ausência de Motoristas',
		},
		NO_EFFECT: {
			message: 'Apesar da ausência de motoristas, as linhas {lines} mantêm o seu funcionamento normal. Consulte os horários em tempo real na app ou site Carris Metropolitana.',
			title: '{lines} | Sem Impacto no Serviço - Ausência de Motoristas',
		},
		NO_SERVICE: {
			message: 'Devido à ausência de motoristas, as linhas {lines} encontram-se temporariamente fora de serviço. Pedimos a compreensão de todos.',
			title: '{lines} | Serviço Suspenso - Ausência de Motoristas',
		},
		OTHER_EFFECT: {
			message: 'Devido à ausência de motoristas, o funcionamento das linhas {lines} pode estar a ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Perturbação no Serviço - Ausência de Motoristas',
		},
		REDUCED_SERVICE: {
			message: 'Devido à ausência de motoristas, as linhas {lines} estão a funcionar de forma reduzida. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Serviço Reduzido - Ausência de Motoristas',
		},
		SIGNIFICANT_DELAYS: {
			message: 'Devido à ausência de motoristas, as linhas {lines} estão a sofrer atrasos significativos. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos',
			title: '{lines} | Atrasos Significativos - Ausência de Motoristas',
		},
		STOP_MOVED: {
			message: 'Devido à ausência de motoristas, uma paragem das linhas {lines} foi temporariamente relocalizada.',
			title: '{lines} | Paragem Relocalizada - Ausência de Motoristas',
		},
		UNKNOWN_EFFECT: {
			message: 'Devido à ausência de motoristas, o funcionamento das linhas {lines} poderá ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Impacto incerto - Ausência de Motoristas',
		},
	},
	DRIVER_ISSUE: {
		ACCESSIBILITY_ISSUE: {
			message: 'Devido a um problema com o motorista, as linhas {lines} poderão sofrer um impacto na acessibilidade. Os passageiros com mobilidade reduzida deverão contactar a linha de apoio.',
			title: '{lines} | Impacto na Acessibilidade - Problema com o Motorista',
		},
		ADDITIONAL_SERVICE: {
			message: 'Devido a um problema com o motorista, foram implementados serviços adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional - Problema com o Motorista',
		},
		DETOUR: {
			message: 'Devido a um problema com o motorista, as linhas {lines} realizam desvio de percurso.',
			title: '{lines} | Desvio de Percurso - Problema com o Motorista',
		},
		MODIFIED_SERVICE: {
			message: 'Devido a um problema com o motorista, o serviço das linhas {lines} foi temporariamente modificado.',
			title: '{lines} | Serviço Modificado - Problema com o Motorista',
		},
		NO_EFFECT: {
			message: 'Apesar de um problema com o motorista, as linhas {lines} mantêm o seu funcionamento normal. Consulte os horários em tempo real na app ou site Carris Metropolitana.',
			title: '{lines} | Sem Impacto no Serviço - Problema com o Motorista',
		},
		NO_SERVICE: {
			message: 'Devido a um problema com o motorista, as linhas {lines} encontram-se temporariamente fora de serviço. Pedimos a compreensão de todos.',
			title: '{lines} | Serviço Suspenso - Problema com o Motorista',
		},
		OTHER_EFFECT: {
			message: 'Devido a um problema com o motorista, o funcionamento das linhas {lines} pode estar a ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Perturbação no Serviço - Problema com o Motorista',
		},
		REDUCED_SERVICE: {
			message: 'Devido a um problema com o motorista, as linhas {lines} estão a funcionar de forma reduzida. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Serviço Reduzido - Problema com o Motorista',
		},
		SIGNIFICANT_DELAYS: {
			message: 'Devido a um problema com o motorista, as linhas {lines} estão a sofrer atrasos significativos. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos',
			title: '{lines} | Atrasos Significativos - Problema com o Motorista',
		},
		STOP_MOVED: {
			message: 'Devido àa um problema com o motorista, uma paragem das linhas {lines} foi temporariamente relocalizada.',
			title: '{lines} | Paragem Relocalizada - Problemas com o Motorista',
		},
		UNKNOWN_EFFECT: {
			message: 'Devido a um problema com o motorista, o funcionamento das linhas {lines} poderá ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Impacto incerto - Problema com o Motorista',
		},
	},
	HIGH_PASSENGER_LOAD: {
		ACCESSIBILITY_ISSUE: {
			message: 'Devido ao elevado número de passageiros, as linhas {lines} poderão sofrer um impacto na acessibilidade. Os passageiros com mobilidade reduzida deverão contactar a linha de apoio.',
			title: '{lines} | Impacto na Acessibilidade - Elevado Volume de Passageiros',
		},
		ADDITIONAL_SERVICE: {
			message: 'Devido ao elevado número de passageiros, foram implementados serviços adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional - Elevado Volume de Passageiros',
		},
		DETOUR: {
			message: 'Devido ao elevado número de passageiros, as linhas {lines} realizam desvio de percurso.',
			title: '{lines} | Desvio de Percurso - Elevado Volume de Passageiros',
		},
		MODIFIED_SERVICE: {
			message: 'Devido ao elevado número de passageiros, o serviço das linhas {lines} foi temporariamente modificado.',
			title: '{lines} | Serviço Modificado - Elevado Volume de Passageiros',
		},
		NO_EFFECT: {
			message: 'Apesar do elevado volume de passageiros, as linhas {lines} mantêm o seu funcionamento normal. Consulte os horários em tempo real na app ou site Carris Metropolitana.',
			title: '{lines} | Sem Impacto no Serviço - Elevado Volume de Passageiros',
		},
		NO_SERVICE: {
			message: 'Devido ao elevado número de passageiros, as linhas {lines} encontram-se temporariamente fora de serviço. Pedimos a compreensão de todos.',
			title: '{lines} | Serviço Suspenso - Elevado Volume de Passageiros',
		},
		OTHER_EFFECT: {
			message: 'Devido ao elevado número de passageiros, o funcionamento das linhas {lines} pode estar a ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Perturbação no Serviço - Elevado Volume de Passageiros',
		},
		REDUCED_SERVICE: {
			message: 'Devido ao elevado número de passageiros, as linhas {lines} estão a funcionar de forma reduzida. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Serviço Reduzido - Elevado Volume de Passageiros',
		},
		SIGNIFICANT_DELAYS: {
			message: 'Devido ao elevado número de passageiros, as linhas {lines} estão a sofrer atrasos significativos. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos',
			title: '{lines} | Atrasos Significativos - Elevado Volume de Passageiros',
		},
		STOP_MOVED: {
			message: 'Devido ao elevado número de passageiros, uma paragem das linhas {lines} foi temporariamente relocalizada.',
			title: '{lines} | Paragem Relocalizada - Elevado Volume de Passageiros',
		},
		UNKNOWN_EFFECT: {
			message: 'Devido ao elevado número de passageiros, o funcionamento das linhas {lines} poderá ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Impacto Incerto - Elevado Volume de Passageiros',
		},
	},
	HOLIDAY: {
		ACCESSIBILITY_ISSUE: {
			message: 'Durante o feriado, as linhas {lines}  poderão sofrer um impacto na acessibildiade. Os passageiros com mobilidade reduzida deverão contactar a linha de apoio.',
			title: '{lines} | Impacto na Acessibilidade - Feriado',
		},
		ADDITIONAL_SERVICE: {
			message: 'Durante o feriado, serão implementados horários adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional - Feriado',
		},
		DETOUR: {
			message: 'Durante o feriado, as linhas {lines} efetuarão desvio de percurso.',
			title: '{lines} | Desvio de Percurso - Feriado',
		},
		MODIFIED_SERVICE: {
			message: 'Durante o feriado, as linhas {lines} terão os seus horários alterados.',
			title: '{lines} | Horário de Feriado - Serviço Modificado',
		},
		NO_EFFECT: {
			message: 'Durante o feriado, as linhas {lines} manterão o funcionamento normal.',
			title: '{lines} | Funcionamento Normal - Feriado',
		},
		NO_SERVICE: {
			message: 'Durante o feriado, as linhas {lines} não estarão em serviço.',
			title: '{lines} | Serviço Suspenso - Feriado',
		},
		OTHER_EFFECT: {
			message: 'Devido ao feriado, as linhas {lines} poderão sofrer alterações no seu serviço.',
			title: '{lines} | Alterações no Serviço - Feriado',
		},
		REDUCED_SERVICE: {
			message: 'Durante o feriado, as linhas {lines} terão a sua frequência reduzida. Pedimos a compreensão de todos.',
			title: '{lines} | Serviço Reduzido - Feriado',
		},
		SIGNIFICANT_DELAYS: {
			message: 'Durante o feriado, as linhas {lines} poderão sofrer atrasos significativos. Pedimos a compreensão de todos.',
			title: '{lines} | Possíveis Atrasos - Feriado',
		},
		STOP_MOVED: {
			message: 'Durante o feriado, a paragem das linhas {lines} será temporariamente relocalizada.',
			title: '{lines} | Paragem Relocalizada - Feriado',
		},
		UNKNOWN_EFFECT: {
			message: 'Durante o feriado, o funcionamento das linhas {lines} poderá ser afetado.',
			title: '{lines} | Impacto Incerto - Feriado',
		},
	},
	MAINTENANCE: {
		ACCESSIBILITY_ISSUE: {
			message: 'Devido a trabalhos de manutenção, as linhas {lines}  poderão sofrer um impacto na acessibildiade. Os passageiros com mobilidade reduzida deverão contactar a linha de apoio.',
			title: '{lines} | Impacto na Acessibilidade - Manutenção',
		},
		ADDITIONAL_SERVICE: {
			message: 'Devido a trabalhos de manutenção, serão implementados horários adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional - Manutenção',
		},
		DETOUR: {
			message: 'Devido a trabalhos de manutenção, as linhas {lines} efetuarão desvio de percurso.',
			title: '{lines} | Desvio de Percurso - Manutenção',
		},
		MODIFIED_SERVICE: {
			message: 'Devido a trabalhos de manutenção, o serviço das linhas {lines} foi temporariamente modificado.',
			title: '{lines} | Serviço Modificado - Manutenção',
		},
		NO_EFFECT: {
			message: 'Apesar dos trabalhos de manutenção, as linhas {lines} manterão o funcionamento normal.',
			title: '{lines} | Funcionamento Normal - Manutenção',
		},
		NO_SERVICE: {
			message: 'Devido a trabalhos de manutenção, as linhas {lines} encontram-se temporariamente fora de serviço. Pedimos a compreensão de todos.',
			title: '{lines} | Serviço Suspenso - Manutenção',
		},
		OTHER_EFFECT: {
			message: 'Devido a trabalhos de manutenção, o funcionamento das linhas {lines} está a ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Perturbação no Serviço - Manutenção',
		},
		REDUCED_SERVICE: {
			message: 'Devido a trabalhos de manutenção, as linhas {lines} estão a funcionar de forma reduzida. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Serviço Reduzido - Manutenção',
		},
		SIGNIFICANT_DELAYS: {
			message: 'Devido a trabalhos de manutenção, as linhas {lines} estão a sofrer atrasos significativos. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Atrasos Significativos - Manutenção',
		},
		STOP_MOVED: {
			message: 'Devido a trabalhos de manutenção, uma paragem das linhas {lines} foi temporariamente relocalizada.',
			title: '{lines} | Paragem Relocalizada - Manutenção',
		},
		UNKNOWN_EFFECT: {
			message: 'Devido a trabalhos de manutenção, o funcionamento das linhas {lines} poderá ser afetado.',
			title: '{lines} | Impacto Incerto - Manutenção',
		},
	},
	MEDICAL_EMERGENCY: {
		ACCESSIBILITY_ISSUE: {
			message: 'Devido a uma emergência médica, as linhas {lines}  poderão sofrer um impacto na acessibildiade. Os passageiros com mobilidade reduzida deverão contactar a linha de apoio.',
			title: '{lines} | Impacto na Acessibilidade - Emergência Médica',
		},
		ADDITIONAL_SERVICE: {
			message: 'Devido a uma emergência médica, serão implementados horários adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional - Emergência Médica',
		},
		DETOUR: {
			message: 'Devido a  uma emergência médica, as linhas {lines} efetuarão desvio de percurso.',
			title: '{lines} | Desvio de Percurso - Emergência Médica',
		},
		MODIFIED_SERVICE: {
			message: 'Devido a uma emergência médica, o serviço das linhas {lines} foi temporariamente modificado.',
			title: '{lines} | Serviço Modificado - Emergência Médica',
		},
		NO_EFFECT: {
			message: 'Apesar da emergência médica, as linhas {lines} manterão o funcionamento normal.',
			title: '{lines} | Funcionamento Normal - Emergência Médica',
		},
		NO_SERVICE: {
			message: 'Devido a uma emergência médica, as linhas {lines} encontram-se temporariamente fora de serviço. Pedimos a compreensão de todos.',
			title: '{lines} | Serviço Suspenso - Emergência Médica',
		},
		OTHER_EFFECT: {
			message: 'Devido a uma emergência médica, o funcionamento das linhas {lines} está a ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos',
			title: '{lines} | Perturbação no Serviço -Manutenção',
		},
		REDUCED_SERVICE: {
			message: 'Devido a uma emergência médica, as linhas {lines} estão a funcionar de forma reduzida. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Serviço Reduzido - Emergência Médica',
		},
		SIGNIFICANT_DELAYS: {
			message: 'Devido a uma emergência médica, as linhas {lines} estão a sofrer atrasos significativos. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Atrasos Significativos - Emergência Médica',
		},
		STOP_MOVED: {
			message: 'Devido a uma emergência médica, uma paragem das linhas {lines} foi temporariamente relocalizada.',
			title: '{lines} | Paragem Relocalizada - Emergência Médica',
		},
		UNKNOWN_EFFECT: {
			message: 'Devido a uma emergência médica, o funcionamento das linhas {lines} poderá ser afetado.',
			title: '{lines} | Impacto Incerto - Emergência Médica',
		},
	},
	OTHER_CAUSE: {
		ACCESSIBILITY_ISSUE: {
			message: 'As linhas {lines} poderão sofrer um impacto na acessibildiade. Os passageiros com mobilidade reduzida deverão contactar a linha de apoio.',
			title: '{lines} | Impacto na Acessibilidade',
		},
		ADDITIONAL_SERVICE: {
			message: 'Serão implementados horários adicionais nas linhas {lines}. Consulte os horários em tempo real na app ou site Carris Metropolitana.',
			title: '{lines} | Serviço Adicional',
		},
		DETOUR: {
			message: 'As linhas {lines} efetuarão desvio de percurso.',
			title: '{lines} | Desvio de Percurso',
		},
		MODIFIED_SERVICE: {
			message: 'O serviço das linhas {lines} foi temporariamente modificado. Consulte os horários em tempo real na app ou site Carris Metropolitana.',
			title: '{lines} | Serviço Modificado',
		},
		NO_EFFECT: {
			message: 'Apesar do condicionamento, as linhas {lines} manterão o funcionamento normal.',
			title: '{lines} | Funcionamento Normal',
		},
		NO_SERVICE: {
			message: 'As linhas {lines} encontram-se temporariamente fora de serviço. Pedimos a compreensão de todos.',
			title: '{lines} | Serviço Suspenso',
		},
		OTHER_EFFECT: {
			message: 'O funcionamento das linhas {lines} está a ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos',
			title: '{lines} | Perturbação no Serviço',
		},
		REDUCED_SERVICE: {
			message: 'As linhas {lines} estão a funcionar de forma reduzida. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Serviço Reduzido',
		},
		SIGNIFICANT_DELAYS: {
			message: 'As linhas {lines} estão a sofrer atrasos significativos. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Atrasos Significativos',
		},
		STOP_MOVED: {
			message: 'Uma paragem das linhas {lines} foi temporariamente relocalizada.',
			title: '{lines} | Paragem Relocalizada',
		},
		UNKNOWN_EFFECT: {
			message: 'O funcionamento das linhas {lines} poderá ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Impacto Incerto',
		},
	},
	POLICE_ACTIVITY: {
		ACCESSIBILITY_ISSUE: {
			message: 'Devido a atividade policial, as linhas {lines}  poderão sofrer um impacto na acessibildiade. Os passageiros com mobilidade reduzida deverão contactar a linha de apoio.',
			title: '{lines} | Impacto na Acessibilidade - Atividade Policial',
		},
		ADDITIONAL_SERVICE: {
			message: 'Devido a atividade policial, serão implementados horários adicionais nas linhas {lines}. Consulte os horários em tempo real na app ou site Carris Metropolitana.',
			title: '{lines} | Serviço Adicional - Atividade Policial',
		},
		DETOUR: {
			message: 'Devido a atividade policial, as linhas {lines} efetuarão desvio de percurso.',
			title: '{lines} | Desvio de Percurso  - Atividade Policial',
		},
		MODIFIED_SERVICE: {
			message: 'Devido a atividade policial, o serviço das linhas {lines} foi temporariamente modificado. Consulte os horários em tempo real na app ou site Carris Metropolitana.',
			title: '{lines} | Serviço Modificado - Atividade Policial',
		},
		NO_EFFECT: {
			message: 'Apesar da atividade policial, as linhas {lines} manterão o funcionamento normal.',
			title: '{lines} | Funcionamento Normal - Atividade Policial',
		},
		NO_SERVICE: {
			message: 'Devido a atividade policial,  as linhas {lines} encontram-se temporariamente fora de serviço. Pedimos a compreensão de todos.',
			title: '{lines} | Serviço Suspenso - Atividade Policial',
		},
		OTHER_EFFECT: {
			message: 'Devido a atividade policial, o funcionamento das linhas {lines} está a ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos',
			title: '{lines} | Perturbação no Serviço - Atividade Policial',
		},
		REDUCED_SERVICE: {
			message: 'Devido a atividade policial, as linhas {lines} estão a funcionar de forma reduzida. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Serviço Reduzido - Atividade Policial',
		},
		SIGNIFICANT_DELAYS: {
			message: 'Devido a atividade policial, as linhas {lines} estão a sofrer atrasos significativos. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Atrasos Significativos - Atividade Policial',
		},
		STOP_MOVED: {
			message: 'Devido a atividade policial, uma paragem das linhas {lines} foi temporariamente relocalizada.',
			title: '{lines} | Paragem Relocalizada - Atividade Policial',
		},
		UNKNOWN_EFFECT: {
			message: 'Devido a atividade policial, o funcionamento das linhas {lines} poderá ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Impacto Incerto - Atividade Policial',
		},
	},
	ROAD_INCIDENT: {
		ACCESSIBILITY_ISSUE: {
			message: 'Devido a um incidente na estrada, as linhas {lines} poderão sofrer um impacto na acessibilidade. Os passageiros com mobilidade reduzida deverão contactar a linha de apoio.',
			title: '{lines} | Impacto na Acessibilidade - Incidente na Estrada',
		},
		ADDITIONAL_SERVICE: {
			message: 'Devido a um incidente na estrada, foram implementados serviços adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional - Incidente na Estrada',
		},
		DETOUR: {
			message: 'Devido a um incidente na estrada, as linhas {lines} realizam desvio de percurso.',
			title: '{lines} | Desvio de Percurso - Incidente na Estrada',
		},
		MODIFIED_SERVICE: {
			message: 'Devido a um incidente na estrada, o serviço das linhas {lines} foi temporariamente modificado.',
			title: '{lines} | Serviço Modificado - Incidente na Estrada',
		},
		NO_EFFECT: {
			message: 'Apesar do incidente na estrada, as linhas {lines} mantêm o seu funcionamento normal. Consulte os horários em tempo real na app ou site Carris Metropolitana.',
			title: '{lines} | Sem Impacto no Serviço - Incidente na Estrada',
		},
		NO_SERVICE: {
			message: 'Devido a um incidente na estrada, as linhas {lines} encontram-se temporariamente fora de serviço. Pedimos a compreensão de todos.',
			title: '{lines} | Serviço Suspenso - Incidente na Estrada',
		},
		OTHER_EFFECT: {
			message: 'Devido a um incidente na estrada, o funcionamento das linhas {lines} pode estar a ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Perturbação no Serviço - Incidente na Estrada',
		},
		REDUCED_SERVICE: {
			message: 'Devido a um incidente na estrada, as linhas {lines} estão a funcionar de forma reduzida. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Serviço Reduzido - Incidente na Estrada',
		},
		SIGNIFICANT_DELAYS: {
			message: 'Devido a um incidente na estrada, as linhas {lines} estão a sofrer atrasos significativos. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos',
			title: '{lines} | Atrasos Significativos - Incidente na Estrada',
		},
		STOP_MOVED: {
			message: 'Devido a um incidente na estrada, uma paragem das linhas {lines} foi temporariamente relocalizada.',
			title: '{lines} | Paragem Relocalizada - Incidente na Estrada',
		},
		UNKNOWN_EFFECT: {
			message: 'Devido a um incidente na estrada, o funcionamento das linhas {lines} poderá ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Impacto Incerto - Incidente na Estrada',
		},
	},
	STRIKE: {
		ACCESSIBILITY_ISSUE: {
			message: 'Devido à greve, as linhas {lines}  poderão sofrer um impacto na acessibildiade. Os passageiros com mobilidade reduzida deverão contactar a linha de apoio.',
			title: '{lines} | Impacto na Acessibilidade - Greve',
		},
		ADDITIONAL_SERVICE: {
			message: 'Devido à greve, serão implementados horários adicionais nas linhas {lines}. Consulte os horários em tempo real na app ou site Carris Metropolitana.',
			title: '{lines} | Serviço Adicional - Greve',
		},
		DETOUR: {
			message: 'Devido à greve, as linhas {lines} efetuarão desvio de percurso.',
			title: '{lines} | Desvio de Percurso - Greve',
		},
		MODIFIED_SERVICE: {
			message: 'Devido à greve, o serviço das linhas {lines} foi temporariamente modificado. Consulte os horários em tempo real na app ou site Carris Metropolitana.',
			title: '{lines} | Serviço Modificado - Greve',
		},
		NO_EFFECT: {
			message: 'Apesar da greve, as linhas {lines} manterão o funcionamento normal.',
			title: '{lines} | Funcionamento Normal - Greve',
		},
		NO_SERVICE: {
			message: 'Devido à greve,  as linhas {lines} encontram-se temporariamente fora de serviço. Pedimos a compreensão de todos.',
			title: '{lines} | Serviço Suspenso - Greve',
		},
		OTHER_EFFECT: {
			message: 'Devido à greve, o funcionamento das linhas {lines} está a ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Perturbação no Serviço - Greve',
		},
		REDUCED_SERVICE: {
			message: 'Devido à greve, as linhas {lines} estão a funcionar de forma reduzida. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Serviço Reduzido - Greve',
		},
		SIGNIFICANT_DELAYS: {
			message: 'Devido à greve, as linhas {lines} estão a sofrer atrasos significativos. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Atrasos Significativos - Greve',
		},
		STOP_MOVED: {
			message: 'Devido à greve, uma paragem das linhas {lines} foi temporariamente relocalizada.',
			title: '{lines} | Paragem Relocalizada - Greve',
		},
		UNKNOWN_EFFECT: {
			message: 'Devido à greve, o funcionamento das linhas {lines} poderá ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Impacto Incerto - Greve',
		},
	},
	SYSTEM_FAILURE: {
		ACCESSIBILITY_ISSUE: {
			message: 'Devido a uma falha no sistema, as linhas {lines} poderão sofrer um impacto na acessibilidade. Os passageiros com mobilidade reduzida deverão contactar a linha de apoio.',
			title: '{lines} | Impacto na Acessibilidade - Falha no Sistema',
		},
		ADDITIONAL_SERVICE: {
			message: 'Devido a uma falha no sistema, foram implementados serviços adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional - Falha no Sistema',
		},
		DETOUR: {
			message: 'Devido a uma falha no sistema, as linhas {lines} realizam desvio de percurso.',
			title: '{lines} | Desvio de Percurso - Falha no Sistema',
		},
		MODIFIED_SERVICE: {
			message: 'Devido a uma falha no sistema, o serviço das linhas {lines} foi temporariamente modificado.',
			title: '{lines} | Serviço Modificado - Falha no Sistema',
		},
		NO_EFFECT: {
			message: 'Apesar de uma falha no sistema, as linhas {lines} mantêm o seu funcionamento normal. Consulte os horários em tempo real na app ou site Carris Metropolitana.',
			title: '{lines} | Sem Impacto no Serviço - Falha no Sistema',
		},
		NO_SERVICE: {
			message: 'Devido a uma falha no sistema, as linhas {lines} encontram-se temporariamente fora de serviço. Pedimos a compreensão de todos.',
			title: '{lines} | Serviço Suspenso - Falha no Sistema',
		},
		OTHER_EFFECT: {
			message: 'Devido a uma falha no sistema, o funcionamento das linhas {lines} pode estar a ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Perturbação no Serviço - Falha no Sistema',
		},
		REDUCED_SERVICE: {
			message: 'Devido a uma falha no sistema, as linhas {lines} estão a funcionar de forma reduzida. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Serviço Reduzido - Falha no Sistema',
		},
		SIGNIFICANT_DELAYS: {
			message: 'Devido a uma falha no sistema, as linhas {lines} estão a sofrer atrasos significativos. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos',
			title: '{lines} | Atrasos Significativos - Falha no Sistema',
		},
		STOP_MOVED: {
			message: 'Devido a uma falha no sistema, uma paragem das linhas {lines} foi temporariamente relocalizada.',
			title: '{lines} | Paragem Relocalizada - Falha no Sistema',
		},
		UNKNOWN_EFFECT: {
			message: 'Devido a uma falha no sistema, o funcionamento das linhas {lines} poderá ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Impacto Incerto - Falha no Sistema',
		},
	},
	TECHNICAL_PROBLEM: {
		ACCESSIBILITY_ISSUE: {
			message: 'Devido a um problema técnico, as linhas {lines}  poderão sofrer um impacto na acessibildiade. Os passageiros com mobilidade reduzida deverão contactar a linha de apoio.',
			title: '{lines} | Impacto na Acessibilidade - Problema Técnico',
		},
		ADDITIONAL_SERVICE: {
			message: 'Devido a um problema técnico, serão implementados horários adicionais nas linhas {lines}. Consulte os horários em tempo real na app ou site Carris Metropolitana.',
			title: '{lines} | Serviço Adicional - Problema Técnico',
		},
		DETOUR: {
			message: 'Devido a um problema técnico, as linhas {lines} efetuarão desvio de percurso.',
			title: '{lines} | Desvio de Percurso - Problema Técnico',
		},
		MODIFIED_SERVICE: {
			message: 'Devido a um problema técnico, o serviço das linhas {lines} foi temporariamente modificado. Consulte os horários em tempo real na app ou site Carris Metropolitana.',
			title: '{lines} | Serviço Modificado - Problema Técnico',
		},
		NO_EFFECT: {
			message: 'Apesar do problema técnico, as linhas {lines} manterão o funcionamento normal.',
			title: '{lines} | Funcionamento Normal - Probema Técnico',
		},
		NO_SERVICE: {
			message: 'Devido a um problema técnico,  as linhas {lines} encontram-se temporariamente fora de serviço. Pedimos a compreensão de todos.',
			title: '{lines} | Serviço Suspenso - Problema Técnico',
		},
		OTHER_EFFECT: {
			message: 'Devido a um problema técnico, o funcionamento das linhas {lines} está a ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Perturbação no Serviço - Problema Técnico',
		},
		REDUCED_SERVICE: {
			message: 'Devido a um problema técnico, as linhas {lines} estão a funcionar de forma reduzida. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Serviço Reduzido - Problema Técnico',
		},
		SIGNIFICANT_DELAYS: {
			message: 'Devido a um problema técnico, as linhas {lines} estão a sofrer atrasos significativos. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Atrasos Significativos - Problema Técnico',
		},
		STOP_MOVED: {
			message: 'Devido a um problema técnico, uma paragem das linhas {lines} foi temporariamente relocalizada.',
			title: '{lines} | Paragem Relocalizada - Problema Técnico',
		},
		UNKNOWN_EFFECT: {
			message: 'Devido a um problema técnico, o funcionamento das linhas {lines} poderá ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Impacto Incerto - Problema Técnico',
		},
	},
	TRAFFIC_JAM: {
		ACCESSIBILITY_ISSUE: {
			message: 'Devido a trânsito congestionado, as linhas {lines} poderão sofrer um impacto na acessibilidade. Os passageiros com mobilidade reduzida deverão contactar a linha de apoio.',
			title: '{lines} | Impacto na Acessibilidade - Trânsito Congestionado',
		},
		ADDITIONAL_SERVICE: {
			message: 'Devido a trânsito congestionado, foram implementados serviços adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional - Trânsito Congestionado',
		},
		DETOUR: {
			message: 'Devido a trânsito congestionado, as linhas {lines} realizam desvio de percurso.',
			title: '{lines} | Desvio de Percurso - Trânsito Congestionado',
		},
		MODIFIED_SERVICE: {
			message: 'Devido a trânsito congestionado, o serviço das linhas {lines} foi temporariamente modificado.',
			title: '{lines} | Serviço Modificado - Trânsito Congestionado',
		},
		NO_EFFECT: {
			message: 'Apesar do trânsito congestionado, as linhas {lines} mantêm o seu funcionamento normal. Consulte os horários em tempo real na app ou site Carris Metropolitana.',
			title: '{lines} | Sem Impacto no Serviço - Trânsito Congestionado',
		},
		NO_SERVICE: {
			message: 'Devido a trânsito congestionado, as linhas {lines} encontram-se temporariamente fora de serviço. Pedimos a compreensão de todos.',
			title: '{lines} | Serviço Suspenso - Trânsito Congestionado',
		},
		OTHER_EFFECT: {
			message: 'Devido a trânsito congestionado, o funcionamento das linhas {lines} pode estar a ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Perturbação no Serviço - Trânsito Congestionado',
		},
		REDUCED_SERVICE: {
			message: 'Devido a trânsito congestionado, as linhas {lines} estão a funcionar de forma reduzida. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Serviço Reduzido - Trânsito Congestionado',
		},
		SIGNIFICANT_DELAYS: {
			message: 'Devido a trânsito congestionado, as linhas {lines} estão a sofrer atrasos significativos. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos',
			title: '{lines} | Atrasos Significativos - Trânsito Congestionado',
		},
		STOP_MOVED: {
			message: 'Devido a trânsito congestionado, uma paragem das linhas {lines} foi temporariamente relocalizada.',
			title: '{lines} | Paragem Relocalizada - Trânsito Congestionado',
		},
		UNKNOWN_EFFECT: {
			message: 'Devido a trânsito congestionado, o funcionamento das linhas {lines} poderá ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Impacto Incerto - Trânsito Congestionado',
		},
	},
	UNKNOWN_CAUSE: {
		ACCESSIBILITY_ISSUE: {
			message: 'As linhas {lines}  poderão sofrer um impacto na acessibildiade. Os passageiros com mobilidade reduzida deverão contactar a linha de apoio.',
			title: '{lines} | Impacto na Acessibilidade',
		},
		ADDITIONAL_SERVICE: {
			message: 'Foram implementados serviços adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional',
		},
		DETOUR: {
			message: 'As linhas {lines} realizam desvio de percurso.',
			title: '{lines} | Desvio de Percurso',
		},
		MODIFIED_SERVICE: {
			message: 'O serviço das linhas {lines} foi temporariamente modificado.',
			title: '{lines} | Serviço Modificado',
		},
		NO_EFFECT: {
			message: 'As linhas {lines} manterão o funcionamento normal.',
			title: '{lines} | Funcionamento Normal',
		},
		NO_SERVICE: {
			message: 'As linhas {lines} encontram-se temporariamente fora de serviço. Pedimos a compreensão de todos.',
			title: '{lines} | Serviço Suspenso',
		},
		OTHER_EFFECT: {
			message: 'O funcionamento das linhas {lines} pode estar a ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Possível Perturbação no Serviço',
		},
		REDUCED_SERVICE: {
			message: 'As linhas {lines} estão a funcionar de forma reduzida. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Serviço Reduzido',
		},
		SIGNIFICANT_DELAYS: {
			message: 'As linhas {lines} estão a sofrer atrasos significativos. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Possíveis Atrasos Significativos',
		},
		STOP_MOVED: {
			message: 'Uma paragem das linhas {lines} foi temporariamente relocalizada.',
			title: '{lines} | Paragem Relocalizada',
		},
		UNKNOWN_EFFECT: {
			message: '',
			title: '',
		},
	},
	VEHICLE_ISSUE: {
		ACCESSIBILITY_ISSUE: {
			message: 'Devido a problemas num veículo, as linhas {lines} poderão sofrer um impacto na acessibilidade. Os passageiros com mobilidade reduzida deverão contactar a linha de apoio.',
			title: '{lines} | Impacto na Acessibilidade - Problemas num veículo',
		},
		ADDITIONAL_SERVICE: {
			message: 'Devido a problemas num veículo, foram implementados serviços adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional - Problemas num veículo',
		},
		DETOUR: {
			message: 'Devido problemas num veículo, as linhas {lines} realizam desvio de percurso.',
			title: '{lines} | Desvio de Percurso - Problemas num veículo',
		},
		MODIFIED_SERVICE: {
			message: 'Devido a problemas num veículo, o serviço das linhas {lines} foi temporariamente modificado.',
			title: '{lines} | Serviço Modificado - Problemas num veículo',
		},
		NO_EFFECT: {
			message: 'Apesar de problemas num veículo, as linhas {lines} mantêm o seu funcionamento normal. Consulte os horários em tempo real na app ou site Carris Metropolitana.',
			title: '{lines} | Sem Impacto no Serviço - Problemas num veículo',
		},
		NO_SERVICE: {
			message: 'Devido a problemas num veículo, as linhas {lines} encontram-se temporariamente fora de serviço. Pedimos a compreensão de todos.',
			title: '{lines} | Serviço Suspenso - Problemas num veículo',
		},
		OTHER_EFFECT: {
			message: 'Devido a problemas num veículo, o funcionamento das linhas {lines} pode estar a ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Perturbação no Serviço - Problemas num veículo',
		},
		REDUCED_SERVICE: {
			message: 'Devido a problemas num veículo, as linhas {lines} estão a funcionar de forma reduzida. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Serviço Reduzido - Problemas num veículo',
		},
		SIGNIFICANT_DELAYS: {
			message: 'Devido a problemas num veículo, as linhas {lines} estão a sofrer atrasos significativos. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos',
			title: '{lines} | Atrasos Significativos - Problemas num veículo',
		},
		STOP_MOVED: {
			message: 'Devido a problemas num veículo, uma paragem das linhas {lines} foi temporariamente relocalizada.',
			title: '{lines} | Paragem Relocalizada - Problemas num veículo',
		},
		UNKNOWN_EFFECT: {
			message: 'Devido a problemas num veículo, o funcionamento das linhas {lines} poderá ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Impacto Incerto - Problemas num veículo',
		},
	},
	WEATHER: {
		ACCESSIBILITY_ISSUE: {
			message: 'Devido às condições meteorológicas, as linhas {lines} poderão sofrer um impacto na acessibilidade. Os passageiros com mobilidade reduzida deverão contactar a linha de apoio.',
			title: '{lines} | Impacto na Acessibilidade - Condições Meteorológicas',
		},
		ADDITIONAL_SERVICE: {
			message: 'Devido às condições meteorológicas, foram implementados serviços adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional - Condições Meteorológicas',
		},
		DETOUR: {
			message: 'Devido às condições meteorológicas, as linhas {lines} realizam desvio de percurso.',
			title: '{lines} | Desvio de Percurso - Condições Meteorológicas',
		},
		MODIFIED_SERVICE: {
			message: 'Devido às condições meteorológicas, o serviço das linhas {lines} foi temporariamente modificado.',
			title: '{lines} | Serviço Modificado - Condições Meteorológicas',
		},
		NO_EFFECT: {
			message: 'Apesar das condições meteorológicas, as linhas {lines} mantêm o seu funcionamento normal. Consulte os horários em tempo real na app ou site Carris Metropolitana.',
			title: '{lines} | Sem Impacto no Serviço - Condições Meteorológicas',
		},
		NO_SERVICE: {
			message: 'Devido às condições meteorológicas, as linhas {lines} encontram-se temporariamente fora de serviço. Pedimos a compreensão de todos.',
			title: '{lines} | Serviço Suspenso - Condições Meteorológicas',
		},
		OTHER_EFFECT: {
			message: 'Devido às condições meteorológicas, o funcionamento das linhas {lines} pode estar a ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Perturbação no Serviço - Condições Meteorológicas',
		},
		REDUCED_SERVICE: {
			message: 'Devido às condições meteorológicas, as linhas {lines} estão a funcionar de forma reduzida. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Serviço Reduzido - Condições Meteorológicas',
		},
		SIGNIFICANT_DELAYS: {
			message: 'Devido às condições meteorológicas, as linhas {lines} estão a sofrer atrasos significativos. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos',
			title: '{lines} | Atrasos Significativos - Condições Meteorológicas',
		},
		STOP_MOVED: {
			message: 'Devido às condições meteorológicas, uma paragem das linhas {lines} foi temporariamente relocalizada.',
			title: '{lines} | Paragem Relocalizada - Condições Meteorológicas',
		},
		UNKNOWN_EFFECT: {
			message: 'Devido às condições meteorológicas, o funcionamento das linhas {lines} poderá ser afetado. Consulte os horários em tempo real na app ou site Carris Metropolitana. Agradecemos a compreensão de todos.',
			title: '{lines} | Impacto incerto - Condições Meteorológicas',
		},
	},
};

export function getAlertTitleAndDescription(cause: GtfsCause, effect: GtfsEffect, lines: string, detour?: string) {
	return {
		description: CauseEffectPairingDefaultAlert[cause][effect].message.replace('{lines}', lines).replace('{detour}', detour ?? ''),
		title: CauseEffectPairingDefaultAlert[cause][effect].title.replace('{lines}', lines),
	};
}
