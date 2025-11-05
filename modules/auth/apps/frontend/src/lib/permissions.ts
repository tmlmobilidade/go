import { Permissions } from '@tmlmobilidade/go-lib';

/* * */

export const RESOURCES_OPTIONS = [
	'AGENCIES',
	'EMAIL_NOTIFICATIONS',
] as const;

export interface PermissionAction<T = unknown> {
	description: string
	key: keyof T | string
	label: string
	resources?: (typeof RESOURCES_OPTIONS)[number][]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PermissionConfig<T = any> {
	actions: PermissionAction<T>[]
	description: string
	scope: string
	title: string
}

/* * */

const agencyActions: PermissionConfig<typeof Permissions.agencies.actions> = {
	actions: [
		{ description: 'Permite ver operadores', key: 'read', label: 'Ver' },
		{ description: 'Permite criar um operador', key: 'create', label: 'Criar' },
		{ description: 'Permite editar um operador', key: 'update', label: 'Editar' },
		{ description: 'Permite eliminar um operador', key: 'delete', label: 'Eliminar' },
		{ description: 'Permite bloquear/desbloquear um operador', key: 'toggle_lock', label: 'Bloquear/Desbloquear' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de operadores.',
	scope: Permissions.agencies.scope,
	title: 'Permissões de Operadores',
};

const alertActions: PermissionConfig<typeof Permissions.alerts.actions> = {
	actions: [
		{ description: 'Permite ver alertas', key: 'read', label: 'Ver' },
		{ description: 'Permite criar um alerta', key: 'create', label: 'Criar' },
		{ description: 'Permite editar um alerta', key: 'update', label: 'Editar' },
		{ description: 'Permite eliminar um alerta', key: 'delete', label: 'Eliminar' },
		{ description: 'Permite bloquear/desbloquear um alerta', key: 'toggle_lock', label: 'Bloquear/Desbloquear' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de alertas.',
	scope: Permissions.alerts.scope,
	title: 'Permissões de Alertas',
};

const realtimeActions: PermissionConfig<typeof Permissions.alerts_realtime.actions> = {
	actions: [
		{ description: 'Permite ver alertas de tempo real', key: 'read', label: 'Ver', resources: ['AGENCIES'] },
		{ description: 'Permite criar um alerta de tempo real', key: 'create', label: 'Criar', resources: ['AGENCIES'] },
		{ description: 'Permite editar um alerta de tempo real', key: 'update', label: 'Editar', resources: ['AGENCIES'] },
		{ description: 'Permite eliminar um alerta de tempo real', key: 'delete', label: 'Eliminar', resources: ['AGENCIES'] },
		{ description: 'Permite bloquear/desbloquear um alerta de tempo real', key: 'toggle_lock', label: 'Bloquear/Desbloquear', resources: ['AGENCIES'] },
	],
	description: 'As ações que o utilizador pode realizar na gestão de alertas de tempo real.',
	scope: Permissions.alerts_realtime.scope,
	title: 'Permissões de Alertas de Tempo Real',
};

const homeActions: PermissionConfig<typeof Permissions.home.actions> = {
	actions: [
		{ description: 'Permite ver Quick Links', key: 'read_links', label: 'Ver Quick Links' },
		{ description: 'Permite ver Wiki', key: 'read_wiki', label: 'Ver Wiki' },
	],
	description: 'As ações que o utilizador pode realizar na home.',
	scope: Permissions.home.scope,
	title: 'Permissões da Home',
};

const planActions: PermissionConfig<typeof Permissions.plans.actions> = {
	actions: [
		{ description: 'Permite ver um plano específico', key: 'read', label: 'Ver', resources: ['AGENCIES'] },
		{ description: 'Permite criar um plano', key: 'create', label: 'Criar', resources: ['AGENCIES'] },
		{ description: 'Permite editar um plano', key: 'update', label: 'Editar', resources: ['AGENCIES'] },
		{ description: 'Permite editar as datas de informação do feed', key: 'update_feed_info_dates', label: 'Editar Datas de Validade', resources: ['AGENCIES'] },
		{ description: 'Permite ver a configuração dos SLAs de um plano', key: 'read_controller', label: 'Ver SLA Controller', resources: ['AGENCIES'] },
		{ description: 'Permite configurar os SLAs de um plano', key: 'update_controller', label: 'Editar SLA Controller', resources: ['AGENCIES'] },
		{ description: 'Permite ver os dados da PCGI Legacy', key: 'read_pcgi_legacy', label: 'Ver PCGI Legacy', resources: ['AGENCIES'] },
		{ description: 'Permite editar os dados da PCGI Legacy', key: 'update_pcgi_legacy', label: 'Editar PCGI Legacy', resources: ['AGENCIES'] },
		{ description: 'Permite bloquear/desbloquear um plano', key: 'toggle_lock', label: 'Bloquear/Desbloquear', resources: ['AGENCIES'] },
		{ description: 'Permite eliminar um plano', key: 'delete', label: 'Eliminar', resources: ['AGENCIES'] },
		{ description: 'Permite alterar o GTFS de um plano', key: 'update_gtfs_plan', label: 'Alterar GTFS', resources: ['AGENCIES'] },
	],
	description: 'As ações que o utilizador pode realizar na gestão de planos.',
	scope: Permissions.plans.scope,
	title: 'Permissões de Planos',
};
const topicActions: PermissionConfig<typeof Permissions.topics.actions> = {
	actions: [
		{ description: 'Notificações para alterações no estado da aceitação', key: 'acceptance_state_modified', label: `Estado da aceitação modificado`, resources: ['EMAIL_NOTIFICATIONS'] },
		{ description: 'Notificações para quando um plano for ativado', key: 'active_plan', label: 'Plano Ativo', resources: ['EMAIL_NOTIFICATIONS'] },
		{ description: 'Notificações para quando um plano for aprovado', key: 'approved_plan', label: 'Plano Aprovado', resources: ['EMAIL_NOTIFICATIONS'] },
		{ description: 'Notificações para quando uma validação for aprovada', key: 'approved_validation', label: 'Validação Aprovada', resources: ['EMAIL_NOTIFICATIONS'] },
		{ description: 'Notificações para quando uma validação for concluída', key: 'concluded_validation', label: 'Validação Concluida', resources: ['EMAIL_NOTIFICATIONS'] },
		{ description: 'Notificações para quando um alerta for criado', key: 'created_alert', label: 'Alerta Criado', resources: ['EMAIL_NOTIFICATIONS'] },
		{ description: 'Notificações para quando um plano for criado', key: 'created_plan', label: 'Plano Criado', resources: ['EMAIL_NOTIFICATIONS'] },
		{ description: 'Notificações para quando um novo comentário na Aceitação da Ride for criado', key: 'new_comentary_network_acceptance', label: 'Novo comentário na Aceitação da Ride', resources: ['EMAIL_NOTIFICATIONS'] },
		{ description: 'Notificações para quando uma ride requer justificação', key: 'ride_requires_justification', label: 'Ride requer justificação', resources: ['EMAIL_NOTIFICATIONS'] },
		{ description: 'Notificações para quando uma validação for enviada', key: 'sent_validation', label: 'Validação Enviada', resources: ['EMAIL_NOTIFICATIONS'] },
		{ description: 'Notificações para quando uma justificação for submetida', key: 'justification_submit', label: 'Justificação Submetida', resources: ['EMAIL_NOTIFICATIONS'] },
		{ description: 'Notificações para quando um plano for submetido', key: 'plan_submit', label: 'Plano submetido', resources: ['EMAIL_NOTIFICATIONS'] },
	],
	description: 'Os tópicos que o utilizador pode subscrever.',
	scope: Permissions.topics.scope,
	title: 'Subscrição de Tópicos',
};

const proposedChangesActions: PermissionConfig<typeof Permissions.proposed_changes.actions> = {
	actions: [
		{ description: 'Criar Proposta de Alterações', key: 'create', label: `Criar Proposta de Alterações` },
		{ description: 'Aprovar as Alterações Propostas', key: 'approve', label: 'Aprovar Alterações Propostas' },
		{ description: 'Rejeitar as Alterações Propostas', key: 'reject', label: 'Rejeitar Alterações Propostas' },
		{ description: 'Consultar Alterações Propostas', key: 'read', label: 'Consultar Alterações Propostas' },
	],
	description: 'As acções que o utilizador pode realizar na gestão de alterações propostas.',
	scope: Permissions.proposed_changes.scope,
	title: 'Permissões de Alterações Propostas',
};

const userActions: PermissionConfig<typeof Permissions.users.actions> = {
	actions: [
		{ description: 'Permite ver utilizadores', key: 'read', label: 'Ver' },
		{ description: 'Permite criar um utilizador', key: 'create', label: 'Criar' },
		{ description: 'Permite editar um utilizador', key: 'update', label: 'Editar' },
		{ description: 'Permite eliminar um utilizador', key: 'delete', label: 'Eliminar' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de utilizadores.',
	scope: Permissions.users.scope,
	title: 'Permissões de Utilizadores',
};

const validationActions: PermissionConfig<typeof Permissions.validations.actions> = {
	actions: [
		{ description: 'Permite ver validações', key: 'read', label: 'Ver', resources: ['AGENCIES'] },
		{ description: 'Permite criar uma validação', key: 'create', label: 'Criar', resources: ['AGENCIES'] },
		{ description: 'Permite solicitar aprovação de uma validação', key: 'request_approval', label: 'Solicitar aprovação', resources: ['AGENCIES'] },
	],
	description: 'As ações que o utilizador pode realizar na gestão de validações GTFS.',
	scope: Permissions.validations.scope,
	title: 'Permissões de Validações (GTFS)',
};

const roleActions: PermissionConfig<typeof Permissions.roles.actions> = {
	actions: [
		{ description: 'Permite ver grupos de permissões', key: 'read', label: 'Ver' },
		{ description: 'Permite criar um grupo de permissões', key: 'create', label: 'Criar' },
		{ description: 'Permite editar um grupo de permissões', key: 'update', label: 'Editar' },
		{ description: 'Permite eliminar um grupo de permissões', key: 'delete', label: 'Eliminar' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de grupos de permissões.',
	scope: Permissions.roles.scope,
	title: 'Permissões de Grupos de Permissões',
};

const organizationActions: PermissionConfig<typeof Permissions.organizations.actions> = {
	actions: [
		{ description: 'Permite ver organizações', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma organização', key: 'create', label: 'Criar' },
		{ description: 'Permite editar uma organização', key: 'update', label: 'Editar' },
		{ description: 'Permite eliminar uma organização', key: 'delete', label: 'Eliminar' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de organizações.',
	scope: Permissions.organizations.scope,
	title: 'Permissões de Organizações',
};

const stopActions: PermissionConfig<typeof Permissions.stops.actions> = {
	actions: [
		{ description: 'Permite ver paragens', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma paragem', key: 'create', label: 'Criar' },
		{ description: 'Permite editar uma paragem', key: 'update', label: 'Editar' },
		{ description: 'Permite eliminar uma paragem', key: 'delete', label: 'Eliminar' },
		{ description: 'Permite bloquear/desbloquear uma paragem', key: 'toggle_lock', label: 'Bloquear/Desbloquear' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de paragens.',
	scope: Permissions.stops.scope,
	title: 'Permissões de Paragens',
};

const rideActions: PermissionConfig<typeof Permissions.rides.actions> = {
	actions: [
		/* Análise */
		{ description: 'Permite bloquear/desbloquear uma análise de uma viagem', key: 'analsys_lock', label: 'Análise - Bloquear/Desbloquear', resources: ['AGENCIES'] },
		{ description: 'Permite ver uma análise de uma viagem', key: 'analysis_read', label: 'Análise - Ver', resources: ['AGENCIES'] },
		{ description: 'Permite reprocessar uma análise de uma viagem', key: 'analysis_reprocess', label: 'Análise - Reprocessar', resources: ['AGENCIES'] },
		/* Auditoria */
		{ description: 'Permite editar uma análise de uma viagem', key: 'analysis_update', label: 'Análise - Editar', resources: ['AGENCIES'] },
		{ description: 'Permite bloquear/desbloquear uma auditoria de uma viagem', key: 'audit_lock', label: 'Auditoria - Bloquear/Desbloquear', resources: ['AGENCIES'] },
		{ description: 'Permite ver uma auditoria de uma viagem', key: 'audit_read', label: 'Auditoria - Ver', resources: ['AGENCIES'] },
		{ description: 'Permite editar uma auditoria de uma viagem', key: 'audit_update', label: 'Auditoria - Editar', resources: ['AGENCIES'] },
		/* Aceitação */
		{ description: 'Permite alterar o estado de uma justificação de uma viagem', key: 'acceptance_change_status', label: 'Aceitação - Alterar estado', resources: ['AGENCIES'] },
		{ description: 'Permite justificar uma viagem', key: 'acceptance_justify', label: 'Aceitação - Justificar', resources: ['AGENCIES'] },
		{ description: 'Permite bloquear/desbloquear uma justificação de uma viagem', key: 'acceptance_lock', label: 'Aceitação - Bloquear/Desbloquear', resources: ['AGENCIES'] },
		{ description: 'Permite ver uma justificação de uma viagem', key: 'acceptance_read', label: 'Aceitação - Ver', resources: ['AGENCIES'] },
	],
	description: 'As ações que o utilizador pode realizar na gestão de viagens.',
	scope: Permissions.rides.scope,
	title: 'Permissões de Viagens',
};

const performanceActions: PermissionConfig<typeof Permissions.performance.actions> = {
	actions: [
		{ description: 'Permite ver métricas', key: 'read', label: 'Ver' },
	],
	description: 'As ações que o utilizador pode realizar na visualização de métricas.',
	scope: Permissions.performance.scope,
	title: 'Permissões de Métricas',
};

/* * */

export const permissionsConfig: PermissionConfig[] = [
	agencyActions,
	alertActions,
	realtimeActions,
	homeActions,
	planActions,
	userActions,
	organizationActions,
	validationActions,
	roleActions,
	stopActions,
	rideActions,
	performanceActions,
	topicActions,
	proposedChangesActions,
];
