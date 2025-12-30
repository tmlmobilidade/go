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
		{ action: 'toggleLock', description: 'agencyActions.descriptions.toggleLock', label: 'agencyActions.labels.toggleLock' },
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
		{ action: 'toggleLock', description: 'alertActions.descriptions.toggleLock', label: 'alertActions.labels.toggleLock' },
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
		{ action: 'toggleLock', description: 'realtimeActions.descriptions.toggleLock', label: 'realtimeActions.labels.toggleLock', resources: ['AGENCIES'] },
	],
	description: 'realtimeActions.description',
	scope: PermissionCatalog.all.alerts_realtime.scope,
	title: 'realtimeActions.title',
};

const homeActions: PermissionConfig = {
	actions: [
		{ action: 'readQuickLinks', description: 'homeActions.descriptions.seeQuickLinks', label: 'homeActions.labels.seeQuickLinks' },
		{ action: 'readWikiLinks', description: 'homeActions.descriptions.seeWikiLinks', label: 'homeActions.labels.seeWikiLinks' },
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
		{ action: 'updateFeedInfoDates', description: 'planActions.descriptions.updateFeedInfoDates', label: 'planActions.labels.updateFeedInfoDates', resources: ['AGENCIES'] },
		{ action: 'readController', description: 'planActions.descriptions.readController', label: 'planActions.labels.readController', resources: ['AGENCIES'] },
		{ action: 'updateController', description: 'planActions.descriptions.updateController', label: 'planActions.labels.updateController', resources: ['AGENCIES'] },
		{ action: 'readPcgiLegacy', description: 'planActions.descriptions.readPcgiLegacy', label: 'planActions.labels.readPcgiLegacy', resources: ['AGENCIES'] },
		{ action: 'updatePcgiLegacy', description: 'planActions.descriptions.updatePcgiLegacy', label: 'planActions.labels.updatePcgiLegacy', resources: ['AGENCIES'] },
		{ action: 'toggleLock', description: 'planActions.descriptions.toggleLock', label: 'planActions.labels.toggleLock', resources: ['AGENCIES'] },
		{ action: 'delete', description: 'planActions.descriptions.delete', label: 'planActions.labels.delete', resources: ['AGENCIES'] },
		{ action: 'updateGtfsPlan', description: 'planActions.descriptions.updateGtfsPlan', label: 'planActions.labels.updateGtfsPlan', resources: ['AGENCIES'] },
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
		{ action: 'toggleLock', description: 'userActions.descriptions.toggleLock', label: 'userActions.labels.toggleLock' },
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
		{ action: 'requestApproval', description: 'gtfsValidationActions.descriptions.requestApproval', label: 'gtfsValidationActions.labels.requestApproval', resources: ['AGENCIES'] },
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
		{ action: 'toggleLock', description: 'roleActions.descriptions.toggleLock', label: 'roleActions.labels.toggleLock' },
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
		{ action: 'toggleLock', description: 'organizationActions.descriptions.toggleLock', label: 'organizationActions.labels.toggleLock' },
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
		{ action: 'toggleLock', description: 'stopActions.descriptions.toggleLock', label: 'stopActions.labels.toggleLock' },
	],
	description: 'stopActions.description',
	scope: PermissionCatalog.all.stops.scope,
	title: 'stopActions.title',
};

const rideActions: PermissionConfig = {
	actions: [
		/* Análise */
		{ action: 'analsysLock', description: 'rideActions.descriptions.analsysLock', label: 'rideActions.labels.analsysLock', resources: ['AGENCIES'] },
		{ action: 'analysisRead', description: 'rideActions.descriptions.analysisRead', label: 'rideActions.labels.analysisRead', resources: ['AGENCIES'] },
		{ action: 'analysisReprocess', description: 'rideActions.descriptions.analysisReprocess', label: 'rideActions.labels.analysisReprocess', resources: ['AGENCIES'] },
		/* Auditoria */
		{ action: 'analysisUpdate', description: 'rideActions.descriptions.analysisUpdate', label: 'rideActions.labels.analysisUpdate', resources: ['AGENCIES'] },
		{ action: 'auditLock', description: 'rideActions.descriptions.auditLock', label: 'rideActions.labels.auditLock', resources: ['AGENCIES'] },
		{ action: 'auditRead', description: 'rideActions.descriptions.auditRead', label: 'rideActions.labels.auditRead', resources: ['AGENCIES'] },
		{ action: 'auditUpdate', description: 'rideActions.descriptions.auditUpdate', label: 'rideActions.labels.auditUpdate', resources: ['AGENCIES'] },
		/* Aceitação */
		{ action: 'acceptanceChangeStatus', description: 'rideActions.descriptions.acceptanceChangeStatus', label: 'rideActions.labels.acceptanceChangeStatus', resources: ['AGENCIES'] },
		{ action: 'acceptanceJustify', description: 'rideActions.descriptions.acceptanceJustify', label: 'rideActions.labels.acceptanceJustify', resources: ['AGENCIES'] },
		{ action: 'acceptanceLock', description: 'rideActions.descriptions.acceptanceLock', label: 'rideActions.labels.acceptanceLock', resources: ['AGENCIES'] },
		{ action: 'acceptanceRead', description: 'rideActions.descriptions.acceptanceRead', label: 'rideActions.labels.acceptanceRead', resources: ['AGENCIES'] },
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

const annotationsActions: PermissionConfig = {
	actions: [
		{ action: 'readAnnotations', description: 'datesActions.descriptions.readAnnotations', label: 'datesActions.labels.readAnnotations', resources: ['AGENCIES'] },
		{ action: 'createAnnotations', description: 'datesActions.descriptions.createAnnotations', label: 'datesActions.labels.createAnnotations', resources: ['AGENCIES'] },
		{ action: 'updateAnnotations', description: 'datesActions.descriptions.updateAnnotations', label: 'datesActions.labels.updateAnnotations', resources: ['AGENCIES'] },
		{ action: 'deleteAnnotations', description: 'datesActions.descriptions.deleteAnnotations', label: 'datesActions.labels.deleteAnnotations', resources: ['AGENCIES'] },
		{ action: 'toggleLockAnnotations', description: 'datesActions.descriptions.toggleLockAnnotations', label: 'datesActions.labels.toggleLockAnnotations', resources: ['AGENCIES'] },
	],
	description: 'annotationsActions.description',
	scope: PermissionCatalog.all.annotations.scope,
	title: 'annotationsActions.title',
};

const periodsActions: PermissionConfig = {
	actions: [
		{ action: 'read', description: 'periodsActions.descriptions.read', label: 'periodsActions.labels.read', resources: ['AGENCIES'] },
		{ action: 'create', description: 'periodsActions.descriptions.create', label: 'periodsActions.labels.create', resources: ['AGENCIES'] },
		{ action: 'update', description: 'periodsActions.descriptions.update', label: 'periodsActions.labels.update', resources: ['AGENCIES'] },
		{ action: 'delete', description: 'periodsActions.descriptions.delete', label: 'periodsActions.labels.delete', resources: ['AGENCIES'] },
		{ action: 'toggleLock', description: 'periodsActions.descriptions.toggleLock', label: 'periodsActions.labels.toggleLock', resources: ['AGENCIES'] },
	],
	description: 'periodsActions.description',
	scope: PermissionCatalog.all.periods.scope,
	title: 'periodsActions.title',
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
	annotationsActions,
	periodsActions,
	// topicActions,
	// proposedChangesActions,
];
