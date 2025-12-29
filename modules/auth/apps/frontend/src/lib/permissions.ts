/* * */

import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

export const RESOURCES_OPTIONS = [
	'AGENCIES',
	'EMAIL_NOTIFICATIONS',
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
		{ action: 'read', description: 'agencyActions.descriptions.read', label: 'agencyActions.labels.read' },
		{ action: 'create', description: 'agencyActions.descriptions.create', label: 'agencyActions.labels.create' },
		{ action: 'update', description: 'agencyActions.descriptions.update', label: 'agencyActions.labels.update' },
		{ action: 'delete', description: 'agencyActions.descriptions.delete', label: 'agencyActions.labels.delete' },
		{ action: 'toggle_lock', description: 'agencyActions.descriptions.toggle_lock', label: 'agencyActions.labels.toggle_lock' },
	],
	description: 'agencyActions.description',
	scope: PermissionCatalog.all.agencies.scope,
	title: 'agencyActions.title',
};

const alertActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'alertActions.descriptions.read', label: 'alertActions.labels.read' },
		{ action: 'create', description: 'alertActions.descriptions.create', label: 'alertActions.labels.create' },
		{ action: 'update', description: 'alertActions.descriptions.update', label: 'alertActions.labels.update' },
		{ action: 'delete', description: 'alertActions.descriptions.delete', label: 'alertActions.labels.delete' },
		{ action: 'toggle_lock', description: 'alertActions.descriptions.toggle_lock', label: 'alertActions.labels.toggle_lock' },
	],
	description: 'alertActions.description',
	scope: PermissionCatalog.all.alerts_scheduled.scope,
	title: 'alertActions.title',
};

const realtimeActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'realtimeActions.descriptions.read', label: 'realtimeActions.labels.read', resources: ['AGENCIES'] },
		{ action: 'create', description: 'realtimeActions.descriptions.create', label: 'realtimeActions.labels.create', resources: ['AGENCIES'] },
		{ action: 'update', description: 'realtimeActions.descriptions.update', label: 'realtimeActions.labels.update', resources: ['AGENCIES'] },
		{ action: 'delete', description: 'realtimeActions.descriptions.delete', label: 'realtimeActions.labels.delete', resources: ['AGENCIES'] },
		{ action: 'toggle_lock', description: 'realtimeActions.descriptions.toggle_lock', label: 'realtimeActions.labels.toggle_lock', resources: ['AGENCIES'] },
	],
	description: 'realtimeActions.description',
	scope: PermissionCatalog.all.alerts_realtime.scope,
	title: 'realtimeActions.title',
};

const homeActions: PermissionConfig = {
	actions: [
		{ action: 'read_links', description: 'homeActions.descriptions.see_quick_links', label: 'homeActions.labels.see_quick_links' },
		{ action: 'read_wiki', description: 'homeActions.descriptions.see_wiki_links', label: 'homeActions.labels.see_wiki_links' },
	],
	description: 'homeActions.description',
	scope: PermissionCatalog.all.home.scope,
	title: 'homeActions.title',
};

const planActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'planActions.descriptions.read', label: 'planActions.labels.read', resources: ['AGENCIES'] },
		{ action: 'create', description: 'planActions.descriptions.create', label: 'planActions.labels.create', resources: ['AGENCIES'] },
		{ action: 'update', description: 'planActions.descriptions.update', label: 'planActions.labels.update', resources: ['AGENCIES'] },
		{ action: 'update_feed_info_dates', description: 'planActions.descriptions.update_feed_info_dates', label: 'planActions.labels.update_feed_info_dates', resources: ['AGENCIES'] },
		{ action: 'read_controller', description: 'planActions.descriptions.read_controller', label: 'planActions.labels.read_controller', resources: ['AGENCIES'] },
		{ action: 'update_controller', description: 'planActions.descriptions.update_controller', label: 'planActions.labels.update_controller', resources: ['AGENCIES'] },
		{ action: 'read_pcgi_legacy', description: 'planActions.descriptions.read_pcgi_legacy', label: 'planActions.labels.read_pcgi_legacy', resources: ['AGENCIES'] },
		{ action: 'update_pcgi_legacy', description: 'planActions.descriptions.update_pcgi_legacy', label: 'planActions.labels.update_pcgi_legacy', resources: ['AGENCIES'] },
		{ action: 'toggle_lock', description: 'planActions.descriptions.toggle_lock', label: 'planActions.labels.toggle_lock', resources: ['AGENCIES'] },
		{ action: 'delete', description: 'planActions.descriptions.delete', label: 'planActions.labels.delete', resources: ['AGENCIES'] },
		{ action: 'update_gtfs_plan', description: 'planActions.descriptions.update_gtfs_plan', label: 'planActions.labels.update_gtfs_plan', resources: ['AGENCIES'] },
	],
	description: 'planActions.description',
	scope: PermissionCatalog.all.plans.scope,
	title: 'planActions.title',
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
		{ action: 'read', description: 'userActions.descriptions.read', label: 'userActions.labels.read' },
		{ action: 'create', description: 'userActions.descriptions.create', label: 'userActions.labels.create' },
		{ action: 'update', description: 'userActions.descriptions.update', label: 'userActions.labels.update' },
		{ action: 'lock', description: 'Permite bloquear um utilizador', label: 'Bloquear' },
		{ action: 'delete', description: 'userActions.descriptions.delete', label: 'userActions.labels.delete' },
	],
	description: 'userActions.description',
	scope: PermissionCatalog.all.users.scope,
	title: 'userActions.title',
};

const gtfsValidationActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'gtfsValidationActions.descriptions.read', label: 'gtfsValidationActions.labels.read', resources: ['AGENCIES'] },
		{ action: 'create', description: 'gtfsValidationActions.descriptions.create', label: 'gtfsValidationActions.labels.create', resources: ['AGENCIES'] },
		{ action: 'request_approval', description: 'gtfsValidationActions.descriptions.request_approval', label: 'gtfsValidationActions.labels.request_approval', resources: ['AGENCIES'] },
	],
	description: 'gtfsValidationActions.description',
	scope: PermissionCatalog.all.gtfs_validations.scope,
	title: 'gtfsValidationActions.title',
};

const roleActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'roleActions.descriptions.read', label: 'roleActions.labels.read' },
		{ action: 'create', description: 'roleActions.descriptions.create', label: 'roleActions.labels.create' },
		{ action: 'update', description: 'roleActions.descriptions.update', label: 'roleActions.labels.update' },
		{ action: 'lock', description: 'Permite bloquear um grupo de permissões', label: 'Bloquear' },
		{ action: 'delete', description: 'roleActions.descriptions.delete', label: 'roleActions.labels.delete' },
	],
	description: 'roleActions.description',
	scope: PermissionCatalog.all.roles.scope,
	title: 'roleActions.title',
};

const organizationActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'organizationActions.descriptions.read', label: 'organizationActions.labels.read' },
		{ action: 'create', description: 'organizationActions.descriptions.create', label: 'organizationActions.labels.create' },
		{ action: 'update', description: 'organizationActions.descriptions.update', label: 'organizationActions.labels.update' },
		{ action: 'lock', description: 'Permite bloquear uma organização', label: 'Bloquear' },
		{ action: 'delete', description: 'organizationActions.descriptions.delete', label: 'organizationActions.labels.delete' },
	],
	description: 'organizationActions.description',
	scope: PermissionCatalog.all.organizations.scope,
	title: 'organizationActions.title',
};

const stopActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'stopActions.descriptions.read', label: 'stopActions.labels.read' },
		{ action: 'create', description: 'stopActions.descriptions.create', label: 'stopActions.labels.create' },
		{ action: 'update', description: 'stopActions.descriptions.update', label: 'stopActions.labels.update' },
		{ action: 'delete', description: 'stopActions.descriptions.delete', label: 'stopActions.labels.delete' },
		{ action: 'toggle_lock', description: 'stopActions.descriptions.toggle_lock', label: 'stopActions.labels.toggle_lock' },
	],
	description: 'stopActions.description',
	scope: PermissionCatalog.all.stops.scope,
	title: 'stopActions.title',
};

const rideActions: PermissionConfig = {
	actions: [
		/* Análise */
		{ action: 'analsys_lock', description: 'rideActions.descriptions.analsys_lock', label: 'rideActions.labels.analsys_lock', resources: ['AGENCIES'] },
		{ action: 'analysis_read', description: 'rideActions.descriptions.analysis_read', label: 'rideActions.labels.analysis_read', resources: ['AGENCIES'] },
		{ action: 'analysis_reprocess', description: 'rideActions.descriptions.analysis_reprocess', label: 'rideActions.labels.analysis_reprocess', resources: ['AGENCIES'] },
		/* Auditoria */
		{ action: 'analysis_update', description: 'rideActions.descriptions.analysis_update', label: 'rideActions.labels.analysis_update', resources: ['AGENCIES'] },
		{ action: 'audit_lock', description: 'rideActions.descriptions.audit_lock', label: 'rideActions.labels.audit_lock', resources: ['AGENCIES'] },
		{ action: 'audit_read', description: 'rideActions.descriptions.audit_read', label: 'rideActions.labels.audit_read', resources: ['AGENCIES'] },
		{ action: 'audit_update', description: 'rideActions.descriptions.audit_update', label: 'rideActions.labels.audit_update', resources: ['AGENCIES'] },
		/* Aceitação */
		{ action: 'acceptance_change_status', description: 'rideActions.descriptions.acceptance_change_status', label: 'rideActions.labels.acceptance_change_status', resources: ['AGENCIES'] },
		{ action: 'acceptance_justify', description: 'rideActions.descriptions.acceptance_justify', label: 'rideActions.labels.acceptance_justify', resources: ['AGENCIES'] },
		{ action: 'acceptance_lock', description: 'rideActions.descriptions.acceptance_lock', label: 'rideActions.labels.acceptance_lock', resources: ['AGENCIES'] },
		{ action: 'acceptance_read', description: 'rideActions.descriptions.acceptance_read', label: 'rideActions.labels.acceptance_read', resources: ['AGENCIES'] },
	],
	description: 'rideActions.description',
	scope: PermissionCatalog.all.rides.scope,
	title: 'rideActions.title',
};

const performanceActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'performanceActions.descriptions.read', label: 'performanceActions.labels.read' },
	],
	description: 'performanceActions.description',
	scope: PermissionCatalog.all.performance.scope,
	title: 'performanceActions.title',
};

const datesActions: PermissionConfig = {
	actions: [
		{ action: 'read_annotations', description: 'datesActions.descriptions.read', label: 'datesActions.labels.read', resources: ['AGENCIES'] },
		{ action: 'create_annotations', description: 'datesActions.descriptions.read', label: 'datesActions.labels.read', resources: ['AGENCIES'] },
		{ action: 'update_annotations', description: 'datesActions.descriptions.read', label: 'datesActions.labels.read', resources: ['AGENCIES'] },
		{ action: 'delete_annotations', description: 'datesActions.descriptions.read', label: 'datesActions.labels.read', resources: ['AGENCIES'] },
		{ action: 'lock_annotations', description: 'datesActions.descriptions.read', label: 'datesActions.labels.read', resources: ['AGENCIES'] },
	],
	description: 'As ações que o utilizador pode realizar na gestão de datas.',
	scope: PermissionCatalog.all.dates.scope,
	title: 'Permissões de Datas',
};

/* * */

export const permissionsConfig = [
	agencyActions,
	alertActions,
	realtimeActions,
	homeActions,
	planActions,
	userActions,
	organizationActions,
	gtfsValidationActions,
	roleActions,
	stopActions,
	rideActions,
	performanceActions,
	datesActions,
	// topicActions,
	// proposedChangesActions,
];
