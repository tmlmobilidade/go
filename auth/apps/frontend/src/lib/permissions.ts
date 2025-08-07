import { Permissions } from '@tmlmobilidade/lib';

/* * */

export const RESOURCES_OPTIONS = [
	'AGENCIES',
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
	],
	description: 'As ações que o utilizador pode realizar na gestão de planos.',
	scope: Permissions.plans.scope,
	title: 'Permissões de Planos',
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
	description: 'As ações que o utilizador pode realizar na gestão de validações.',
	scope: Permissions.validations.scope,
	title: 'Permissões de Validações',
};

const roleActions: PermissionConfig<typeof Permissions.roles.actions> = {
	actions: [
		{ description: 'Permite ver organizações', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma organização', key: 'create', label: 'Criar' },
		{ description: 'Permite editar uma organização', key: 'update', label: 'Editar' },
		{ description: 'Permite eliminar uma organização', key: 'delete', label: 'Eliminar' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de papéis.',
	scope: Permissions.roles.scope,
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
		{ description: 'Permite ver viagens', key: 'read', label: 'Ver' },
		{ description: 'Permite editar uma viagem', key: 'update', label: 'Editar' },
		{ description: 'Permite bloquear/desbloquear uma viagem', key: 'toggle_lock', label: 'Bloquear/Desbloquear' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de viagens.',
	scope: Permissions.rides.scope,
	title: 'Permissões de Viagens',
};

/* * */

export const permissionsConfig: PermissionConfig[] = [
	agencyActions,
	alertActions,
	homeActions,
	planActions,
	userActions,
	validationActions,
	roleActions,
	stopActions,
	rideActions,
];
