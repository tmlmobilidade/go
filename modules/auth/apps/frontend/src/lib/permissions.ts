/* * */

import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

export const RESOURCES_OPTIONS = [
	'AGENCIES',
	'ALERT_REFERENCE_TYPES',
] as const;

export interface PermissionConfigAction {
	action: string
	description: string
	label: string
	resources?: (typeof RESOURCES_OPTIONS)[number][]
}

export interface PermissionConfig {
	actions: PermissionConfigAction[]
	description: string
	scope: string
	title: string
}

/* * */

const agencyActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'Permite ver operadores', label: 'Ver' },
		{ action: 'create', description: 'Permite criar um operador', label: 'Criar' },
		{ action: 'update', description: 'Permite editar um operador', label: 'Editar' },
		{ action: 'delete', description: 'Permite eliminar um operador', label: 'Eliminar' },
		{ action: 'lock', description: 'Permite bloquear/desbloquear um operador', label: 'Bloquear/Desbloquear' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de operadores.',
	scope: PermissionCatalog.all.agencies.scope,
	title: 'Permissões de Operadores',
};

const alertsActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'Permite ver alertas', label: 'Ver', resources: ['AGENCIES', 'ALERT_REFERENCE_TYPES'] },
		{ action: 'create', description: 'Permite criar um alerta', label: 'Criar', resources: ['AGENCIES', 'ALERT_REFERENCE_TYPES'] },
		{ action: 'update', description: 'Permite editar um alerta', label: 'Editar', resources: ['AGENCIES', 'ALERT_REFERENCE_TYPES'] },
		{ action: 'delete', description: 'Permite eliminar um alerta', label: 'Eliminar', resources: ['AGENCIES', 'ALERT_REFERENCE_TYPES'] },
		{ action: 'update_texts', description: 'Permite editar os textos de um alerta', label: 'Editar Textos', resources: ['AGENCIES', 'ALERT_REFERENCE_TYPES'] },
		{ action: 'update_dates', description: 'Permite alterar as datas de um alerta', label: 'Alterar Datas', resources: ['AGENCIES', 'ALERT_REFERENCE_TYPES'] },
		{ action: 'update_publish_status', description: 'Permite alterar o estado de publicação de um alerta', label: 'Alterar Estado de Publicação', resources: ['AGENCIES', 'ALERT_REFERENCE_TYPES'] },
	],
	description: 'As ações que o utilizador pode realizar na gestão de alertas.',
	scope: PermissionCatalog.all.alerts.scope,
	title: 'Permissões de Alertas',
};

const homeActions: PermissionConfig = {
	actions: [
		{ action: 'read_links', description: 'Permite ver Quick Links', label: 'Ver Quick Links' },
		{ action: 'read_wiki', description: 'Permite ver Wiki', label: 'Ver Wiki' },
	],
	description: 'As ações que o utilizador pode realizar na home.',
	scope: PermissionCatalog.all.home.scope,
	title: 'Permissões da Home',
};

const planActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'Permite ver um plano específico', label: 'Ver', resources: ['AGENCIES'] },
		{ action: 'create', description: 'Permite criar um plano', label: 'Criar', resources: ['AGENCIES'] },
		{ action: 'update', description: 'Permite editar um plano', label: 'Editar', resources: ['AGENCIES'] },
		{ action: 'update_feed_info_dates', description: 'Permite editar as datas de informação do feed', label: 'Editar Datas de Validade', resources: ['AGENCIES'] },
		{ action: 'read_controller', description: 'Permite ver a configuração dos SLAs de um plano', label: 'Ver SLA Controller', resources: ['AGENCIES'] },
		{ action: 'update_controller', description: 'Permite configurar os SLAs de um plano', label: 'Editar SLA Controller', resources: ['AGENCIES'] },
		{ action: 'read_pcgi_legacy', description: 'Permite ver os dados da PCGI Legacy', label: 'Ver PCGI Legacy', resources: ['AGENCIES'] },
		{ action: 'update_pcgi_legacy', description: 'Permite editar os dados da PCGI Legacy', label: 'Editar PCGI Legacy', resources: ['AGENCIES'] },
		{ action: 'lock', description: 'Permite bloquear/desbloquear um plano', label: 'Bloquear/Desbloquear', resources: ['AGENCIES'] },
		{ action: 'delete', description: 'Permite eliminar um plano', label: 'Eliminar', resources: ['AGENCIES'] },
		{ action: 'update_gtfs_plan', description: 'Permite alterar o GTFS de um plano', label: 'Alterar GTFS', resources: ['AGENCIES'] },
	],
	description: 'As ações que o utilizador pode realizar na gestão de planos.',
	scope: PermissionCatalog.all.plans.scope,
	title: 'Permissões de Planos',
};

// const topicActions: PermissionConfig = {
// 	actions: [
// 		{ description: 'Notificações para alterações no estado da aceitação', action: 'acceptance_state_modified', label: `Estado da aceitação modificado`, resources: ['EMAIL_NOTIFICATIONS'] },
// 		{ description: 'Notificações para quando um plano for ativado', action: 'active_plan', label: 'Plano Ativo', resources: ['EMAIL_NOTIFICATIONS'] },
// 		{ description: 'Notificações para quando um plano for aprovado', action: 'approved_plan', label: 'Plano Aprovado', resources: ['EMAIL_NOTIFICATIONS'] },
// 		{ description: 'Notificações para quando uma validação for aprovada', action: 'approved_validation', label: 'Validação Aprovada', resources: ['EMAIL_NOTIFICATIONS'] },
// 		{ description: 'Notificações para quando uma validação for concluída', action: 'concluded_validation', label: 'Validação Concluida', resources: ['EMAIL_NOTIFICATIONS'] },
// 		{ description: 'Notificações para quando um alerta for criado', action: 'created_alert', label: 'Alerta Criado', resources: ['EMAIL_NOTIFICATIONS'] },
// 		{ description: 'Notificações para quando um plano for criado', action: 'created_plan', label: 'Plano Criado', resources: ['EMAIL_NOTIFICATIONS'] },
// 		{ description: 'Notificações para quando um novo comentário na Aceitação da Ride for criado', action: 'new_comentary_network_acceptance', label: 'Novo comentário na Aceitação da Ride', resources: ['EMAIL_NOTIFICATIONS'] },
// 		{ description: 'Notificações para quando uma ride requer justificação', action: 'ride_requires_justification', label: 'Ride requer justificação', resources: ['EMAIL_NOTIFICATIONS'] },
// 		{ description: 'Notificações para quando uma validação for enviada', action: 'sent_validation', label: 'Validação Enviada', resources: ['EMAIL_NOTIFICATIONS'] },
// 		{ description: 'Notificações para quando uma justificação for submetida', action: 'justification_submit', label: 'Justificação Submetida', resources: ['EMAIL_NOTIFICATIONS'] },
// 		{ description: 'Notificações para quando um plano for submetido', action: 'plan_submit', label: 'Plano submetido', resources: ['EMAIL_NOTIFICATIONS'] },
// 	],
// 	description: 'Os tópicos que o utilizador pode subscrever.',
// 	scope: Permissions.topics.scope,
// 	title: 'Subscrição de Tópicos',
// };

// const proposedChangesActions: PermissionConfig = {
// 	actions: [
// 		{ description: 'Criar Proposta de Alterações', action: 'create', label: `Criar Proposta de Alterações` },
// 		{ description: 'Aprovar as Alterações Propostas', action: 'approve', label: 'Aprovar Alterações Propostas' },
// 		{ description: 'Rejeitar as Alterações Propostas', action: 'reject', label: 'Rejeitar Alterações Propostas' },
// 		{ description: 'Consultar Alterações Propostas', action: 'read', label: 'Consultar Alterações Propostas' },
// 	],
// 	description: 'As acções que o utilizador pode realizar na gestão de alterações propostas.',
// 	scope: Permissions.proposed_changes.scope,
// 	title: 'Permissões de Alterações Propostas',
// };

const userActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'Permite ver utilizadores', label: 'Ver' },
		{ action: 'create', description: 'Permite criar um utilizador', label: 'Criar' },
		{ action: 'update', description: 'Permite editar um utilizador', label: 'Editar' },
		{ action: 'lock', description: 'Permite bloquear um utilizador', label: 'Bloquear' },
		{ action: 'delete', description: 'Permite eliminar um utilizador', label: 'Eliminar' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de utilizadores.',
	scope: PermissionCatalog.all.users.scope,
	title: 'Permissões de Utilizadores',
};

const gtfsValidationActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'Permite ver validações', label: 'Ver', resources: ['AGENCIES'] },
		{ action: 'create', description: 'Permite criar uma validação', label: 'Criar', resources: ['AGENCIES'] },
		{ action: 'request_approval', description: 'Permite solicitar aprovação de uma validação', label: 'Solicitar aprovação', resources: ['AGENCIES'] },
		{ action: 'update_processing_status', description: 'Permite alterar o estado de processamento de uma validação', label: 'Alterar estado de processamento', resources: ['AGENCIES'] },
	],
	description: 'As ações que o utilizador pode realizar na gestão de validações GTFS.',
	scope: PermissionCatalog.all.gtfs_validations.scope,
	title: 'Permissões de Validações (GTFS)',
};

const roleActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'Permite ver grupos de permissões', label: 'Ver' },
		{ action: 'create', description: 'Permite criar um grupo de permissões', label: 'Criar' },
		{ action: 'update', description: 'Permite editar um grupo de permissões', label: 'Editar' },
		{ action: 'lock', description: 'Permite bloquear um grupo de permissões', label: 'Bloquear' },
		{ action: 'delete', description: 'Permite eliminar um grupo de permissões', label: 'Eliminar' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de grupos de permissões.',
	scope: PermissionCatalog.all.roles.scope,
	title: 'Permissões de Grupos de Permissões',
};

const organizationActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'Permite ver organizações', label: 'Ver' },
		{ action: 'create', description: 'Permite criar uma organização', label: 'Criar' },
		{ action: 'update', description: 'Permite editar uma organização', label: 'Editar' },
		{ action: 'lock', description: 'Permite bloquear uma organização', label: 'Bloquear' },
		{ action: 'delete', description: 'Permite eliminar uma organização', label: 'Eliminar' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de organizações.',
	scope: PermissionCatalog.all.organizations.scope,
	title: 'Permissões de Organizações',
};

const stopActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'Permite ver paragens', label: 'Ver' },
		{ action: 'create', description: 'Permite criar uma paragem', label: 'Criar' },
		{ action: 'update', description: 'Permite editar uma paragem', label: 'Editar' },
		{ action: 'delete', description: 'Permite eliminar uma paragem', label: 'Eliminar' },
		{ action: 'lock', description: 'Permite bloquear/desbloquear uma paragem', label: 'Bloquear/Desbloquear' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de paragens.',
	scope: PermissionCatalog.all.stops.scope,
	title: 'Permissões de Paragens',
};

const rideActions: PermissionConfig = {
	actions: [
		/* Análise */
		{ action: 'analsys_lock', description: 'Permite bloquear/desbloquear uma análise de uma viagem', label: 'Análise - Bloquear/Desbloquear', resources: ['AGENCIES'] },
		{ action: 'analysis_read', description: 'Permite ver uma análise de uma viagem', label: 'Análise - Ver', resources: ['AGENCIES'] },
		{ action: 'analysis_reprocess', description: 'Permite reprocessar uma análise de uma viagem', label: 'Análise - Reprocessar', resources: ['AGENCIES'] },
		/* Auditoria */
		{ action: 'analysis_update', description: 'Permite editar uma análise de uma viagem', label: 'Análise - Editar', resources: ['AGENCIES'] },
		{ action: 'audit_lock', description: 'Permite bloquear/desbloquear uma auditoria de uma viagem', label: 'Auditoria - Bloquear/Desbloquear', resources: ['AGENCIES'] },
		{ action: 'audit_read', description: 'Permite ver uma auditoria de uma viagem', label: 'Auditoria - Ver', resources: ['AGENCIES'] },
		{ action: 'audit_update', description: 'Permite editar uma auditoria de uma viagem', label: 'Auditoria - Editar', resources: ['AGENCIES'] },
		/* Aceitação */
		{ action: 'acceptance_change_status', description: 'Permite alterar o estado de uma justificação de uma viagem', label: 'Aceitação - Alterar estado', resources: ['AGENCIES'] },
		{ action: 'acceptance_justify', description: 'Permite justificar uma viagem', label: 'Aceitação - Justificar', resources: ['AGENCIES'] },
		{ action: 'acceptance_lock', description: 'Permite bloquear/desbloquear uma justificação de uma viagem', label: 'Aceitação - Bloquear/Desbloquear', resources: ['AGENCIES'] },
		{ action: 'acceptance_read', description: 'Permite ver uma justificação de uma viagem', label: 'Aceitação - Ver', resources: ['AGENCIES'] },
		{ action: 'acceptance_comment_activity', description: 'Permite adicionar comentários à aceitação de uma viagem', label: 'Aceitação - Adicionar comentário', resources: ['AGENCIES'] },
	],
	description: 'As ações que o utilizador pode realizar na gestão de viagens.',
	scope: PermissionCatalog.all.rides.scope,
	title: 'Permissões de Viagens',
};

const performanceActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'Permite ver métricas', label: 'Ver' },
	],
	description: 'As ações que o utilizador pode realizar na visualização de métricas.',
	scope: PermissionCatalog.all.performance.scope,
	title: 'Permissões do Performance Explorer',
};

const annotationsActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'Permite ver anotações', label: 'Ver anotações', resources: ['AGENCIES'] },
		{ action: 'create', description: 'Permite criar uma anotação', label: 'Criar anotação', resources: ['AGENCIES'] },
		{ action: 'update', description: 'Permite editar uma anotação', label: 'Editar anotação', resources: ['AGENCIES'] },
		{ action: 'delete', description: 'Permite eliminar uma anotação', label: 'Eliminar anotação', resources: ['AGENCIES'] },
		{ action: 'lock', description: 'Permite bloquear/desbloquear uma anotação', label: 'Bloquear/Desbloquear', resources: ['AGENCIES'] },
	],
	description: 'As ações que o utilizador pode realizar na gestão de anotações.',
	scope: PermissionCatalog.all.annotations.scope,
	title: 'Permissões de Anotações',
};

const eventsActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'Permite ver eventos', label: 'Ver eventos', resources: ['AGENCIES'] },
		{ action: 'create', description: 'Permite criar um evento', label: 'Criar evento', resources: ['AGENCIES'] },
		{ action: 'update', description: 'Permite editar um evento', label: 'Editar evento', resources: ['AGENCIES'] },
		{ action: 'delete', description: 'Permite eliminar um evento', label: 'Eliminar evento', resources: ['AGENCIES'] },
		{ action: 'lock', description: 'Permite bloquear/desbloquear um evento', label: 'Bloquear/Desbloquear', resources: ['AGENCIES'] },
	],
	description: 'As ações que o utilizador pode realizar na gestão de eventos.',
	scope: PermissionCatalog.all.events.scope,
	title: 'Permissões de Eventos',
};

const holidaysActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'Permite ver feriados', label: 'Ver feriados', resources: ['AGENCIES'] },
		{ action: 'create', description: 'Permite criar um feriado', label: 'Criar feriado', resources: ['AGENCIES'] },
		{ action: 'update', description: 'Permite editar um feriado', label: 'Editar feriado', resources: ['AGENCIES'] },
		{ action: 'delete', description: 'Permite eliminar um feriado', label: 'Eliminar feriado', resources: ['AGENCIES'] },
		{ action: 'lock', description: 'Permite bloquear/desbloquear um feriado', label: 'Bloquear/Desbloquear', resources: ['AGENCIES'] },
	],
	description: 'As ações que o utilizador pode realizar na gestão de feriados.',
	scope: PermissionCatalog.all.holidays.scope,
	title: 'Permissões de Feriados',
};

const periodsActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'Permite ver períodos', label: 'Ver períodos', resources: ['AGENCIES'] },
		{ action: 'create', description: 'Permite criar um período', label: 'Criar período', resources: ['AGENCIES'] },
		{ action: 'update', description: 'Permite editar um período', label: 'Editar período', resources: ['AGENCIES'] },
		{ action: 'delete', description: 'Permite eliminar um período', label: 'Eliminar período', resources: ['AGENCIES'] },
		{ action: 'lock', description: 'Permite bloquear/desbloquear um período', label: 'Bloquear/Desbloquear', resources: ['AGENCIES'] },
	],
	description: 'As ações que o utilizador pode realizar na gestão de períodos.',
	scope: PermissionCatalog.all.year_periods.scope,
	title: 'Permissões de Períodos',
};

const faresActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'Permite ver tarifas', label: 'Ver tarifas', resources: ['AGENCIES'] },
		{ action: 'create', description: 'Permite criar uma tarifa', label: 'Criar tarifa', resources: ['AGENCIES'] },
		{ action: 'update', description: 'Permite editar uma tarifa', label: 'Editar tarifa', resources: ['AGENCIES'] },
		{ action: 'delete', description: 'Permite eliminar uma tarifa', label: 'Eliminar tarifa', resources: ['AGENCIES'] },
		{ action: 'lock', description: 'Permite bloquear/desbloquear uma tarifa', label: 'Bloquear/Desbloquear', resources: ['AGENCIES'] },
	],
	description: 'As ações que o utilizador pode realizar na gestão de tarifas.',
	scope: PermissionCatalog.all.fares.scope,
	title: 'Permissões de Tarifas',
};

const zonesActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'Permite ver zonas', label: 'Ver zonas', resources: ['AGENCIES'] },
		{ action: 'create', description: 'Permite criar uma zona', label: 'Criar zona', resources: ['AGENCIES'] },
		{ action: 'update', description: 'Permite editar uma zona', label: 'Editar zona', resources: ['AGENCIES'] },
		{ action: 'delete', description: 'Permite eliminar uma zona', label: 'Eliminar zona', resources: ['AGENCIES'] },
		{ action: 'lock', description: 'Permite bloquear/desbloquear uma zona', label: 'Bloquear/Desbloquear', resources: ['AGENCIES'] },
	],
	description: 'As ações que o utilizador pode realizar na gestão de zonas.',
	scope: PermissionCatalog.all.zones.scope,
	title: 'Permissões de Zonas',
};

const typologiesActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'Permite ver tipologias', label: 'Ver tipologias', resources: ['AGENCIES'] },
		{ action: 'create', description: 'Permite criar uma tipologia', label: 'Criar tipologia', resources: ['AGENCIES'] },
		{ action: 'update', description: 'Permite editar uma tipologia', label: 'Editar tipologia', resources: ['AGENCIES'] },
		{ action: 'delete', description: 'Permite eliminar uma tipologia', label: 'Eliminar tipologia', resources: ['AGENCIES'] },
		{ action: 'lock', description: 'Permite bloquear/desbloquear uma tipologia', label: 'Bloquear/Desbloquear', resources: ['AGENCIES'] },
	],
	description: 'As ações que o utilizador pode realizar na gestão de tipologias.',
	scope: PermissionCatalog.all.typologies.scope,
	title: 'Permissões de Tipologias',
};

const linesActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'Permite ver linhas', label: 'Ver linhas', resources: ['AGENCIES'] },
		{ action: 'create', description: 'Permite criar uma linha', label: 'Criar linha', resources: ['AGENCIES'] },
		{ action: 'update', description: 'Permite editar uma linha', label: 'Editar linha', resources: ['AGENCIES'] },
		{ action: 'delete', description: 'Permite eliminar uma linha', label: 'Eliminar linha', resources: ['AGENCIES'] },
		{ action: 'lock', description: 'Permite bloquear/desbloquear uma linha', label: 'Bloquear/Desbloquear', resources: ['AGENCIES'] },
	],
	description: 'As ações que o utilizador pode realizar na gestão de linhas.',
	scope: PermissionCatalog.all.lines.scope,
	title: 'Permissões de Linhas',
};

const fleetActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'Permite ver veículos', label: 'Ver veículos', resources: ['AGENCIES'] },
		{ action: 'create', description: 'Permite criar um veículo', label: 'Criar veículo', resources: ['AGENCIES'] },
		{ action: 'update', description: 'Permite editar um veículo', label: 'Editar veículo', resources: ['AGENCIES'] },
		{ action: 'delete', description: 'Permite eliminar um veículo', label: 'Eliminar veículo', resources: ['AGENCIES'] },
		{ action: 'lock', description: 'Permite bloquear/desbloquear um veículo', label: 'Bloquear/Desbloquear veículo', resources: ['AGENCIES'] },
	],
	description: 'As ações que o utilizador pode realizar na gestão de veículos.',
	scope: PermissionCatalog.all.vehicles.scope,
	title: 'Permissões de Veículos',
};

const samsActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'Permite ver Sams', label: 'Ver Sams' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de Sams.',
	scope: PermissionCatalog.all.sams.scope,
	title: 'Permissões de Sams',
};

/* * */

export const permissionsConfig = [
	agencyActions,
	alertsActions,
	homeActions,
	planActions,
	userActions,
	organizationActions,
	gtfsValidationActions,
	roleActions,
	stopActions,
	rideActions,
	performanceActions,
	fleetActions,
	annotationsActions,
	periodsActions,
	faresActions,
	zonesActions,
	typologiesActions,
	eventsActions,
	linesActions,
	holidaysActions,
	samsActions,
	// topicActions,
	// proposedChangesActions,
];
