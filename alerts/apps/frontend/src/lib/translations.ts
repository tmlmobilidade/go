import { Cause, Effect } from '@tmlmobilidade/types';

export const Translations = {
	CAUSE: {
		ACCIDENT: 'Acidente',
		CONSTRUCTION: 'Obras',
		DEMONSTRATION: 'Evento',
		HOLIDAY: 'Férias',
		MAINTENANCE: 'Manutenção',
		MEDICAL_EMERGENCY: 'Emergência Médica',
		OTHER_CAUSE: 'Outras Causas',
		POLICE_ACTIVITY: 'Atividade Policial',
		STRIKE: 'Greve',
		TECHNICAL_PROBLEM: 'Problema Técnico',
		UNKNOWN_CAUSE: 'Causa Desconhecida',
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
};

export const CauseEffectPairingDefaultAlert = {
	ACCIDENT: {
		ACCESSIBILITY_ISSUE: {
			description: 'Devido a um acidente, existem problemas de acessibilidade nas linhas {lines}. Passageiros com mobilidade reduzida devem contactar o operador para assistência.',
			title: '{lines} | Problemas de Acessibilidade - Acidente',
		},
		ADDITIONAL_SERVICE: {
			description: 'Devido a um acidente, foram implementados serviços adicionais nas linhas {lines} para minimizar o impacto na circulação.',
			title: '{lines} | Serviço Adicional - Acidente',
		},
		DETOUR: {
			description: 'Devido a um acidente, as linhas {lines} circulam com desvio de percurso. Consulte os horários alternativos.',
			title: '{lines} | Desvio de Percurso - Acidente',
		},
		MODIFIED_SERVICE: {
			description: 'Devido a um acidente, o serviço das linhas {lines} foi modificado. Consulte as alterações nos horários e paragens.',
			title: '{lines} | Serviço Modificado - Acidente',
		},
		NO_EFFECT: {
			description: 'Ocorreu um acidente na área, mas as linhas {lines} mantêm o serviço normal.',
			title: '{lines} | Sem Impacto no Serviço - Acidente',
		},
		NO_SERVICE: {
			description: 'Devido a um acidente, as linhas {lines} encontram-se temporariamente suspensas. Utilize percursos alternativos.',
			title: '{lines} | Serviço Suspenso - Acidente',
		},
		OTHER_EFFECT: {
			description: 'Um acidente está a afetar o funcionamento das linhas {lines}. Consulte informações atualizadas junto do operador.',
			title: '{lines} | Perturbação no Serviço - Acidente',
		},
		REDUCED_SERVICE: {
			description: 'Devido a um acidente, as linhas {lines} operam com frequência reduzida. Preveja tempos de espera mais longos.',
			title: '{lines} | Serviço Reduzido - Acidente',
		},
		SIGNIFICANT_DELAYS: {
			description: 'Um acidente está a causar atrasos significativos nas linhas {lines}. Preveja tempos de viagem mais longos.',
			title: '{lines} | Atrasos Significativos - Acidente',
		},
		STOP_MOVED: {
			description: 'Devido a um acidente, a paragem das linhas {lines} foi temporariamente relocalizada. Consulte a nova localização.',
			title: '{lines} | Paragem Relocada - Acidente',
		},
		UNKNOWN_EFFECT: {
			description: 'Ocorreu um acidente que pode afetar as linhas {lines}. Mantenha-se informado sobre possíveis alterações.',
			title: '{lines} | Impacto Incerto - Acidente',
		},
	},
	CONSTRUCTION: {
		ACCESSIBILITY_ISSUE: {
			description: 'Obras na via pública afetam a acessibilidade nas linhas {lines}. Passageiros com mobilidade reduzida devem contactar o operador.',
			title: '{lines} | Problemas de Acessibilidade - Obras',
		},
		ADDITIONAL_SERVICE: {
			description: 'Durante as obras, foram implementados serviços adicionais nas linhas {lines} para manter a qualidade do transporte.',
			title: '{lines} | Serviço Adicional - Obras',
		},
		DETOUR: {
			description: 'Devido a obras na via, as linhas {lines} circulam com desvio de percurso temporário.',
			title: '{lines} | Desvio de Percurso - Obras',
		},
		MODIFIED_SERVICE: {
			description: 'Obras na área obrigam à modificação do serviço das linhas {lines}. Consulte os novos horários e percursos.',
			title: '{lines} | Serviço Modificado - Obras',
		},
		NO_EFFECT: {
			description: 'Apesar das obras na área, as linhas {lines} mantêm o funcionamento normal.',
			title: '{lines} | Sem Impacto no Serviço - Obras',
		},
		NO_SERVICE: {
			description: 'Devido a obras na via, as linhas {lines} encontram-se temporariamente suspensas.',
			title: '{lines} | Serviço Suspenso - Obras',
		},
		OTHER_EFFECT: {
			description: 'Obras na área estão a afetar o funcionamento das linhas {lines}. Consulte informações atualizadas.',
			title: '{lines} | Perturbação no Serviço - Obras',
		},
		REDUCED_SERVICE: {
			description: 'Durante as obras, as linhas {lines} operam com frequência reduzida.',
			title: '{lines} | Serviço Reduzido - Obras',
		},
		SIGNIFICANT_DELAYS: {
			description: 'Obras na via estão a causar atrasos significativos nas linhas {lines}.',
			title: '{lines} | Atrasos Significativos - Obras',
		},
		STOP_MOVED: {
			description: 'Devido a obras, a paragem das linhas {lines} foi temporariamente relocada.',
			title: '{lines} | Paragem Relocada - Obras',
		},
		UNKNOWN_EFFECT: {
			description: 'Obras na área podem afetar o funcionamento das linhas {lines}. Mantenha-se informado.',
			title: '{lines} | Impacto Incerto - Obras',
		},
	},
	DEMONSTRATION: {
		ACCESSIBILITY_ISSUE: {
			description: 'Uma manifestação está a afetar a acessibilidade nas linhas {lines}. Contacte o operador para assistência.',
			title: '{lines} | Problemas de Acessibilidade - Manifestação',
		},
		ADDITIONAL_SERVICE: {
			description: 'Devido a uma manifestação, foram implementados serviços adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional - Manifestação',
		},
		DETOUR: {
			description: 'Uma manifestação obriga as linhas {lines} a circular com desvio de percurso.',
			title: '{lines} | Desvio de Percurso - Manifestação',
		},
		MODIFIED_SERVICE: {
			description: 'Devido a uma manifestação, o serviço das linhas {lines} foi modificado temporariamente.',
			title: '{lines} | Serviço Modificado - Manifestação',
		},
		NO_EFFECT: {
			description: 'Apesar da manifestação na área, as linhas {lines} mantêm o funcionamento normal.',
			title: '{lines} | Sem Impacto no Serviço - Manifestação',
		},
		NO_SERVICE: {
			description: 'Devido a uma manifestação, as linhas {lines} encontram-se temporariamente suspensas.',
			title: '{lines} | Serviço Suspenso - Manifestação',
		},
		OTHER_EFFECT: {
			description: 'Uma manifestação está a afetar o funcionamento das linhas {lines}.',
			title: '{lines} | Perturbação no Serviço - Manifestação',
		},
		REDUCED_SERVICE: {
			description: 'Devido a uma manifestação, as linhas {lines} operam com frequência reduzida.',
			title: '{lines} | Serviço Reduzido - Manifestação',
		},
		SIGNIFICANT_DELAYS: {
			description: 'Uma manifestação está a causar atrasos significativos nas linhas {lines}.',
			title: '{lines} | Atrasos Significativos - Manifestação',
		},
		STOP_MOVED: {
			description: 'Devido a uma manifestação, a paragem das linhas {lines} foi temporariamente relocada.',
			title: '{lines} | Paragem Relocada - Manifestação',
		},
		UNKNOWN_EFFECT: {
			description: 'Uma manifestação pode afetar o funcionamento das linhas {lines}. Mantenha-se informado.',
			title: '{lines} | Impacto Incerto - Manifestação',
		},
	},
	HOLIDAY: {
		ACCESSIBILITY_ISSUE: {
			description: 'Durante o feriado, existem limitações de acessibilidade nas linhas {lines}. Contacte o operador para informações.',
			title: '{lines} | Problemas de Acessibilidade - Feriado',
		},
		ADDITIONAL_SERVICE: {
			description: 'Durante o feriado, foram implementados serviços adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional - Feriado',
		},
		DETOUR: {
			description: 'Durante o feriado, as linhas {lines} circulam com percurso modificado.',
			title: '{lines} | Desvio de Percurso - Feriado',
		},
		MODIFIED_SERVICE: {
			description: 'Horário especial de feriado em vigor nas linhas {lines}. Consulte os novos horários.',
			title: '{lines} | Horário de Feriado - Serviço Modificado',
		},
		NO_EFFECT: {
			description: 'Durante o feriado, as linhas {lines} mantêm o funcionamento normal.',
			title: '{lines} | Funcionamento Normal - Feriado',
		},
		NO_SERVICE: {
			description: 'Durante o feriado, as linhas {lines} não se encontram em funcionamento.',
			title: '{lines} | Sem Serviço - Feriado',
		},
		OTHER_EFFECT: {
			description: 'O feriado afeta o funcionamento das linhas {lines}. Consulte informações especiais.',
			title: '{lines} | Alterações no Serviço - Feriado',
		},
		REDUCED_SERVICE: {
			description: 'Durante o feriado, as linhas {lines} operam com frequência reduzida.',
			title: '{lines} | Serviço Reduzido - Feriado',
		},
		SIGNIFICANT_DELAYS: {
			description: 'Durante o feriado, preveja possíveis atrasos nas linhas {lines}.',
			title: '{lines} | Possíveis Atrasos - Feriado',
		},
		STOP_MOVED: {
			description: 'Durante o feriado, algumas paragens das linhas {lines} podem estar relocadas.',
			title: '{lines} | Paragens Alteradas - Feriado',
		},
		UNKNOWN_EFFECT: {
			description: 'O feriado pode afetar o funcionamento das linhas {lines}. Consulte informações atualizadas.',
			title: '{lines} | Impacto Incerto - Feriado',
		},
	},
	MAINTENANCE: {
		ACCESSIBILITY_ISSUE: {
			description: 'Trabalhos de manutenção afetam a acessibilidade nas linhas {lines}. Contacte o operador para assistência.',
			title: '{lines} | Problemas de Acessibilidade - Manutenção',
		},
		ADDITIONAL_SERVICE: {
			description: 'Durante a manutenção, foram implementados serviços adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional - Manutenção',
		},
		DETOUR: {
			description: 'Trabalhos de manutenção obrigam as linhas {lines} a circular com desvio de percurso.',
			title: '{lines} | Desvio de Percurso - Manutenção',
		},
		MODIFIED_SERVICE: {
			description: 'Devido a trabalhos de manutenção, o serviço das linhas {lines} foi modificado.',
			title: '{lines} | Serviço Modificado - Manutenção',
		},
		NO_EFFECT: {
			description: 'Apesar dos trabalhos de manutenção, as linhas {lines} mantêm o funcionamento normal.',
			title: '{lines} | Sem Impacto no Serviço - Manutenção',
		},
		NO_SERVICE: {
			description: 'Devido a trabalhos de manutenção, as linhas {lines} encontram-se temporariamente suspensas.',
			title: '{lines} | Serviço Suspenso - Manutenção',
		},
		OTHER_EFFECT: {
			description: 'Trabalhos de manutenção estão a afetar o funcionamento das linhas {lines}.',
			title: '{lines} | Perturbação no Serviço - Manutenção',
		},
		REDUCED_SERVICE: {
			description: 'Durante os trabalhos de manutenção, as linhas {lines} operam com frequência reduzida.',
			title: '{lines} | Serviço Reduzido - Manutenção',
		},
		SIGNIFICANT_DELAYS: {
			description: 'Trabalhos de manutenção estão a causar atrasos significativos nas linhas {lines}.',
			title: '{lines} | Atrasos Significativos - Manutenção',
		},
		STOP_MOVED: {
			description: 'Devido a trabalhos de manutenção, a paragem das linhas {lines} foi temporariamente relocada.',
			title: '{lines} | Paragem Relocada - Manutenção',
		},
		UNKNOWN_EFFECT: {
			description: 'Trabalhos de manutenção podem afetar o funcionamento das linhas {lines}.',
			title: '{lines} | Impacto Incerto - Manutenção',
		},
	},
	MEDICAL_EMERGENCY: {
		ACCESSIBILITY_ISSUE: {
			description: 'Uma emergência médica está a afetar a acessibilidade nas linhas {lines}. Contacte o operador para assistência.',
			title: '{lines} | Problemas de Acessibilidade - Emergência Médica',
		},
		ADDITIONAL_SERVICE: {
			description: 'Devido a uma emergência médica, foram implementados serviços adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional - Emergência Médica',
		},
		DETOUR: {
			description: 'Uma emergência médica obriga as linhas {lines} a circular com desvio de percurso.',
			title: '{lines} | Desvio de Percurso - Emergência Médica',
		},
		MODIFIED_SERVICE: {
			description: 'Devido a uma emergência médica, o serviço das linhas {lines} foi temporariamente modificado.',
			title: '{lines} | Serviço Modificado - Emergência Médica',
		},
		NO_EFFECT: {
			description: 'Apesar da emergência médica na área, as linhas {lines} mantêm o funcionamento normal.',
			title: '{lines} | Sem Impacto no Serviço - Emergência Médica',
		},
		NO_SERVICE: {
			description: 'Devido a uma emergência médica, as linhas {lines} encontram-se temporariamente suspensas.',
			title: '{lines} | Serviço Suspenso - Emergência Médica',
		},
		OTHER_EFFECT: {
			description: 'Uma emergência médica está a afetar o funcionamento das linhas {lines}.',
			title: '{lines} | Perturbação no Serviço - Emergência Médica',
		},
		REDUCED_SERVICE: {
			description: 'Devido a uma emergência médica, as linhas {lines} operam com frequência reduzida.',
			title: '{lines} | Serviço Reduzido - Emergência Médica',
		},
		SIGNIFICANT_DELAYS: {
			description: 'Uma emergência médica está a causar atrasos significativos nas linhas {lines}.',
			title: '{lines} | Atrasos Significativos - Emergência Médica',
		},
		STOP_MOVED: {
			description: 'Devido a uma emergência médica, a paragem das linhas {lines} foi temporariamente relocada.',
			title: '{lines} | Paragem Relocada - Emergência Médica',
		},
		UNKNOWN_EFFECT: {
			description: 'Uma emergência médica pode afetar o funcionamento das linhas {lines}.',
			title: '{lines} | Impacto Incerto - Emergência Médica',
		},
	},
	OTHER_CAUSE: {
		ACCESSIBILITY_ISSUE: {
			description: 'Problemas não especificados estão a afetar a acessibilidade nas linhas {lines}.',
			title: '{lines} | Problemas de Acessibilidade',
		},
		ADDITIONAL_SERVICE: {
			description: 'Foram implementados serviços adicionais nas linhas {lines} devido a circunstâncias especiais.',
			title: '{lines} | Serviço Adicional',
		},
		DETOUR: {
			description: 'As linhas {lines} circulam com desvio de percurso devido a circunstâncias imprevistas.',
			title: '{lines} | Desvio de Percurso',
		},
		MODIFIED_SERVICE: {
			description: 'O serviço das linhas {lines} foi modificado devido a circunstâncias especiais.',
			title: '{lines} | Serviço Modificado',
		},
		NO_EFFECT: {
			description: 'Apesar de circunstâncias na área, as linhas {lines} mantêm o funcionamento normal.',
			title: '{lines} | Sem Impacto no Serviço',
		},
		NO_SERVICE: {
			description: 'As linhas {lines} encontram-se temporariamente suspensas.',
			title: '{lines} | Serviço Suspenso',
		},
		OTHER_EFFECT: {
			description: 'Circunstâncias especiais estão a afetar o funcionamento das linhas {lines}.',
			title: '{lines} | Perturbação no Serviço',
		},
		REDUCED_SERVICE: {
			description: 'As linhas {lines} operam com frequência reduzida devido a circunstâncias imprevistas.',
			title: '{lines} | Serviço Reduzido',
		},
		SIGNIFICANT_DELAYS: {
			description: 'Circunstâncias imprevistas estão a causar atrasos significativos nas linhas {lines}.',
			title: '{lines} | Atrasos Significativos',
		},
		STOP_MOVED: {
			description: 'A paragem das linhas {lines} foi temporariamente relocada.',
			title: '{lines} | Paragem Relocada',
		},
		UNKNOWN_EFFECT: {
			description: 'Possível impacto no funcionamento das linhas {lines}. Mantenha-se informado.',
			title: '{lines} | Impacto Incerto',
		},
	},
	POLICE_ACTIVITY: {
		ACCESSIBILITY_ISSUE: {
			description: 'Atividade policial está a afetar a acessibilidade nas linhas {lines}. Contacte o operador para assistência.',
			title: '{lines} | Problemas de Acessibilidade - Atividade Policial',
		},
		ADDITIONAL_SERVICE: {
			description: 'Devido a atividade policial, foram implementados serviços adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional - Atividade Policial',
		},
		DETOUR: {
			description: 'Atividade policial obriga as linhas {lines} a circular com desvio de percurso.',
			title: '{lines} | Desvio de Percurso - Atividade Policial',
		},
		MODIFIED_SERVICE: {
			description: 'Devido a atividade policial, o serviço das linhas {lines} foi temporariamente modificado.',
			title: '{lines} | Serviço Modificado - Atividade Policial',
		},
		NO_EFFECT: {
			description: 'Apesar da atividade policial na área, as linhas {lines} mantêm o funcionamento normal.',
			title: '{lines} | Sem Impacto no Serviço - Atividade Policial',
		},
		NO_SERVICE: {
			description: 'Devido a atividade policial, as linhas {lines} encontram-se temporariamente suspensas.',
			title: '{lines} | Serviço Suspenso - Atividade Policial',
		},
		OTHER_EFFECT: {
			description: 'Atividade policial está a afetar o funcionamento das linhas {lines}.',
			title: '{lines} | Perturbação no Serviço - Atividade Policial',
		},
		REDUCED_SERVICE: {
			description: 'Devido a atividade policial, as linhas {lines} operam com frequência reduzida.',
			title: '{lines} | Serviço Reduzido - Atividade Policial',
		},
		SIGNIFICANT_DELAYS: {
			description: 'Atividade policial está a causar atrasos significativos nas linhas {lines}.',
			title: '{lines} | Atrasos Significativos - Atividade Policial',
		},
		STOP_MOVED: {
			description: 'Devido a atividade policial, a paragem das linhas {lines} foi temporariamente relocada.',
			title: '{lines} | Paragem Relocada - Atividade Policial',
		},
		UNKNOWN_EFFECT: {
			description: 'Atividade policial pode afetar o funcionamento das linhas {lines}.',
			title: '{lines} | Impacto Incerto - Atividade Policial',
		},
	},
	STRIKE: {
		ACCESSIBILITY_ISSUE: {
			description: 'A greve está a afetar a acessibilidade nas linhas {lines}. Contacte o operador para informações.',
			title: '{lines} | Problemas de Acessibilidade - Greve',
		},
		ADDITIONAL_SERVICE: {
			description: 'Durante a greve, foram implementados serviços adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional - Greve',
		},
		DETOUR: {
			description: 'Devido à greve, as linhas {lines} circulam com percurso alternativo.',
			title: '{lines} | Desvio de Percurso - Greve',
		},
		MODIFIED_SERVICE: {
			description: 'A greve obriga à modificação do serviço das linhas {lines}. Consulte os serviços mínimos.',
			title: '{lines} | Serviço Modificado - Greve',
		},
		NO_EFFECT: {
			description: 'Apesar da greve, as linhas {lines} mantêm o funcionamento normal.',
			title: '{lines} | Sem Impacto no Serviço - Greve',
		},
		NO_SERVICE: {
			description: 'Devido à greve, as linhas {lines} não se encontram em funcionamento.',
			title: '{lines} | Sem Serviço - Greve',
		},
		OTHER_EFFECT: {
			description: 'A greve está a afetar o funcionamento das linhas {lines}. Consulte os serviços disponíveis.',
			title: '{lines} | Perturbação no Serviço - Greve',
		},
		REDUCED_SERVICE: {
			description: 'Durante a greve, as linhas {lines} operam com serviços mínimos.',
			title: '{lines} | Serviços Mínimos - Greve',
		},
		SIGNIFICANT_DELAYS: {
			description: 'A greve está a causar atrasos significativos nas linhas {lines}.',
			title: '{lines} | Atrasos Significativos - Greve',
		},
		STOP_MOVED: {
			description: 'Devido à greve, algumas paragens das linhas {lines} podem estar alteradas.',
			title: '{lines} | Paragens Alteradas - Greve',
		},
		UNKNOWN_EFFECT: {
			description: 'A greve pode afetar o funcionamento das linhas {lines}. Consulte os serviços disponíveis.',
			title: '{lines} | Impacto Incerto - Greve',
		},
	},
	TECHNICAL_PROBLEM: {
		ACCESSIBILITY_ISSUE: {
			description: 'Um problema técnico está a afetar a acessibilidade nas linhas {lines}. Contacte o operador para assistência.',
			title: '{lines} | Problemas de Acessibilidade - Problema Técnico',
		},
		ADDITIONAL_SERVICE: {
			description: 'Devido a um problema técnico, foram implementados serviços adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional - Problema Técnico',
		},
		DETOUR: {
			description: 'Um problema técnico obriga as linhas {lines} a circular com desvio de percurso.',
			title: '{lines} | Desvio de Percurso - Problema Técnico',
		},
		MODIFIED_SERVICE: {
			description: 'Devido a um problema técnico, o serviço das linhas {lines} foi temporariamente modificado.',
			title: '{lines} | Serviço Modificado - Problema Técnico',
		},
		NO_EFFECT: {
			description: 'Apesar do problema técnico, as linhas {lines} mantêm o funcionamento normal.',
			title: '{lines} | Sem Impacto no Serviço - Problema Técnico',
		},
		NO_SERVICE: {
			description: 'Devido a um problema técnico, as linhas {lines} encontram-se temporariamente suspensas.',
			title: '{lines} | Serviço Suspenso - Problema Técnico',
		},
		OTHER_EFFECT: {
			description: 'Um problema técnico está a afetar o funcionamento das linhas {lines}.',
			title: '{lines} | Perturbação no Serviço - Problema Técnico',
		},
		REDUCED_SERVICE: {
			description: 'Devido a um problema técnico, as linhas {lines} operam com frequência reduzida.',
			title: '{lines} | Serviço Reduzido - Problema Técnico',
		},
		SIGNIFICANT_DELAYS: {
			description: 'Um problema técnico está a causar atrasos significativos nas linhas {lines}.',
			title: '{lines} | Atrasos Significativos - Problema Técnico',
		},
		STOP_MOVED: {
			description: 'Devido a um problema técnico, a paragem das linhas {lines} foi temporariamente relocada.',
			title: '{lines} | Paragem Relocada - Problema Técnico',
		},
		UNKNOWN_EFFECT: {
			description: 'Um problema técnico pode afetar o funcionamento das linhas {lines}.',
			title: '{lines} | Impacto Incerto - Problema Técnico',
		},
	},
	UNKNOWN_CAUSE: {
		ACCESSIBILITY_ISSUE: {
			description: 'Problemas não identificados estão a afetar a acessibilidade nas linhas {lines}.',
			title: '{lines} | Problemas de Acessibilidade - Causa Desconhecida',
		},
		ADDITIONAL_SERVICE: {
			description: 'Foram implementados serviços adicionais nas linhas {lines} por motivos não especificados.',
			title: '{lines} | Serviço Adicional - Causa Desconhecida',
		},
		DETOUR: {
			description: 'As linhas {lines} circulam com desvio de percurso por motivos não especificados.',
			title: '{lines} | Desvio de Percurso - Causa Desconhecida',
		},
		MODIFIED_SERVICE: {
			description: 'O serviço das linhas {lines} foi modificado por motivos não especificados.',
			title: '{lines} | Serviço Modificado - Causa Desconhecida',
		},
		NO_EFFECT: {
			description: 'As linhas {lines} mantêm o funcionamento normal.',
			title: '{lines} | Funcionamento Normal',
		},
		NO_SERVICE: {
			description: 'As linhas {lines} encontram-se temporariamente suspensas.',
			title: '{lines} | Serviço Suspenso',
		},
		OTHER_EFFECT: {
			description: 'O funcionamento das linhas {lines} pode estar afetado. Mantenha-se informado.',
			title: '{lines} | Possível Perturbação no Serviço',
		},
		REDUCED_SERVICE: {
			description: 'As linhas {lines} operam com frequência reduzida por motivos não especificados.',
			title: '{lines} | Serviço Reduzido',
		},
		SIGNIFICANT_DELAYS: {
			description: 'Preveem-se atrasos significativos nas linhas {lines} por motivos não especificados.',
			title: '{lines} | Possíveis Atrasos Significativos',
		},
		STOP_MOVED: {
			description: 'A paragem das linhas {lines} foi temporariamente relocada.',
			title: '{lines} | Paragem Relocada',
		},
		UNKNOWN_EFFECT: {
			description: 'Possível impacto no funcionamento das linhas {lines}. Mantenha-se informado.',
			title: '{lines} | Impacto Incerto',
		},
	},
	WEATHER: {
		ACCESSIBILITY_ISSUE: {
			description: 'As condições meteorológicas estão a afetar a acessibilidade nas linhas {lines}. Contacte o operador para assistência.',
			title: '{lines} | Problemas de Acessibilidade - Condições Meteorológicas',
		},
		ADDITIONAL_SERVICE: {
			description: 'Devido às condições meteorológicas, foram implementados serviços adicionais nas linhas {lines}.',
			title: '{lines} | Serviço Adicional - Condições Meteorológicas',
		},
		DETOUR: {
			description: 'As condições meteorológicas obrigam as linhas {lines} a circular com desvio de percurso.',
			title: '{lines} | Desvio de Percurso - Condições Meteorológicas',
		},
		MODIFIED_SERVICE: {
			description: 'Devido às condições meteorológicas, o serviço das linhas {lines} foi modificado.',
			title: '{lines} | Serviço Modificado - Condições Meteorológicas',
		},
		NO_EFFECT: {
			description: 'Apesar das condições meteorológicas, as linhas {lines} mantêm o funcionamento normal.',
			title: '{lines} | Sem Impacto no Serviço - Condições Meteorológicas',
		},
		NO_SERVICE: {
			description: 'Devido às condições meteorológicas adversas, as linhas {lines} encontram-se suspensas.',
			title: '{lines} | Serviço Suspenso - Condições Meteorológicas',
		},
		OTHER_EFFECT: {
			description: 'As condições meteorológicas estão a afetar o funcionamento das linhas {lines}.',
			title: '{lines} | Perturbação no Serviço - Condições Meteorológicas',
		},
		REDUCED_SERVICE: {
			description: 'Devido às condições meteorológicas, as linhas {lines} operam com frequência reduzida.',
			title: '{lines} | Serviço Reduzido - Condições Meteorológicas',
		},
		SIGNIFICANT_DELAYS: {
			description: 'As condições meteorológicas estão a causar atrasos significativos nas linhas {lines}.',
			title: '{lines} | Atrasos Significativos - Condições Meteorológicas',
		},
		STOP_MOVED: {
			description: 'Devido às condições meteorológicas, a paragem das linhas {lines} foi temporariamente relocada.',
			title: '{lines} | Paragem Relocada - Condições Meteorológicas',
		},
		UNKNOWN_EFFECT: {
			description: 'As condições meteorológicas pode afetar o funcionamento das linhas {lines}.',
			title: '{lines} | Impacto Incerto - Condições Meteorológicas',
		},
	},
};

export function getAlertTitleAndDescription(cause: Cause, effect: Effect, lines: string) {
	return {
		description: CauseEffectPairingDefaultAlert[cause][effect].description.replace('{lines}', lines),
		title: CauseEffectPairingDefaultAlert[cause][effect].title.replace('{lines}', lines),
	};
}
