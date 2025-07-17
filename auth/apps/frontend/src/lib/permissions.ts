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
		{ description: 'Permite listar agências', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma agência específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma agência', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma agência', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma agência', key: 'delete', label: 'Eliminar' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de agências.',
	scope: Permissions.agencies.scope,
	title: 'Permissões de Agências',
};

const alertActions: PermissionConfig<typeof Permissions.alerts.actions> = {
	actions: [
		{ description: 'Permite listar alertas', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar um alerta específico', key: 'read', label: 'Ver' },
		{ description: 'Permite criar um alerta', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar um alerta', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar um alerta', key: 'delete', label: 'Eliminar' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de alertas.',
	scope: Permissions.alerts.scope,
	title: 'Permissões de Alertas',
};

const fileActions: PermissionConfig<typeof Permissions.files.actions> = {
	actions: [
		{ description: 'Permite listar ficheiros', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar um ficheiro específico', key: 'read', label: 'Ver' },
		{ description: 'Permite carregar um ficheiro', key: 'create', label: 'Carregar' },
		{ description: 'Permite atualizar um ficheiro', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar um ficheiro', key: 'delete', label: 'Eliminar' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de ficheiros.',
	scope: Permissions.files.scope,
	title: 'Permissões de Ficheiros',
};

const hashedShapeActions: PermissionConfig<typeof Permissions.hashedShapes.actions> = {
	actions: [
		{ description: 'Permite listar formas codificadas', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma forma codificada específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma forma codificada', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma forma codificada', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma forma codificada', key: 'delete', label: 'Eliminar' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de formas codificadas.',
	scope: Permissions.hashedShapes.scope,
	title: 'Permissões de Formas Codificadas',
};

const hashedTripActions: PermissionConfig<typeof Permissions.hashedTrips.actions> = {
	actions: [
		{ description: 'Permite listar viagens codificadas', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma viagem codificada específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma viagem codificada', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma viagem codificada', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma viagem codificada', key: 'delete', label: 'Eliminar' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de viagens codificadas.',
	scope: Permissions.hashedTrips.scope,
	title: 'Permissões de Viagens Codificadas',
};

const municipalityActions: PermissionConfig<typeof Permissions.municipalities.actions> = {
	actions: [
		{ description: 'Permite listar municípios', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar um município específico', key: 'read', label: 'Ver' },
		{ description: 'Permite criar um município', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar um município', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar um município', key: 'delete', label: 'Eliminar' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de municípios.',
	scope: Permissions.municipalities.scope,
	title: 'Permissões de Municípios',
};

const organizationActions: PermissionConfig<typeof Permissions.organizations.actions> = {
	actions: [
		{ description: 'Permite listar organizações', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma organização específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma organização', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma organização', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma organização', key: 'delete', label: 'Eliminar' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de organizações.',
	scope: Permissions.organizations.scope,
	title: 'Permissões de Organizações',
};

const planActions: PermissionConfig<typeof Permissions.plans.actions> = {
	actions: [
		{ description: 'Permite listar planos', key: 'list', label: 'Listar', resources: ['AGENCIES'] },
		{ description: 'Permite visualizar um plano específico', key: 'read', label: 'Ver', resources: ['AGENCIES'] },
		{ description: 'Permite criar um plano', key: 'create', label: 'Criar', resources: ['AGENCIES'] },
		{ description: 'Permite atualizar um plano', key: 'update', label: 'Atualizar', resources: ['AGENCIES'] },
		{ description: 'Permite eliminar um plano', key: 'delete', label: 'Eliminar', resources: ['AGENCIES'] },
	],
	description: 'As ações que o utilizador pode realizar na gestão de planos.',
	scope: Permissions.plans.scope,
	title: 'Permissões de Planos',
};

const userActions: PermissionConfig<typeof Permissions.users.actions> = {
	actions: [
		{ description: 'Permite listar utilizadores', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar um utilizador específico', key: 'read', label: 'Ver' },
		{ description: 'Permite criar um utilizador', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar um utilizador', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar um utilizador', key: 'delete', label: 'Eliminar' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de utilizadores.',
	scope: Permissions.users.scope,
	title: 'Permissões de Utilizadores',
};

const validationActions: PermissionConfig<typeof Permissions.validations.actions> = {
	actions: [
		{ description: 'Permite listar validações', key: 'list', label: 'Listar', resources: ['AGENCIES'] },
		{ description: 'Permite visualizar uma validação específica', key: 'read', label: 'Ver', resources: ['AGENCIES'] },
		{ description: 'Permite criar uma validação', key: 'create', label: 'Criar', resources: ['AGENCIES'] },
		{ description: 'Permite atualizar uma validação', key: 'update', label: 'Atualizar', resources: ['AGENCIES'] },
		{ description: 'Permite eliminar uma validação', key: 'delete', label: 'Eliminar', resources: ['AGENCIES'] },
		{ description: 'Permite converter uma validação para um plano', key: 'create_plan', label: 'Converter para plano', resources: ['AGENCIES'] },
	],
	description: 'As ações que o utilizador pode realizar na gestão de validações.',
	scope: Permissions.validations.scope,
	title: 'Permissões de Validações',
};

const roleActions: PermissionConfig<typeof Permissions.roles.actions> = {
	actions: [
		{ description: 'Permite listar papéis', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar um papel específico', key: 'read', label: 'Ver' },
		{ description: 'Permite criar um papel', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar um papel', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar um papel', key: 'delete', label: 'Eliminar' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de papéis.',
	scope: Permissions.roles.scope,
	title: 'Permissões de Papéis',
};

const sessionActions: PermissionConfig<typeof Permissions.sessions.actions> = {
	actions: [
		{ description: 'Permite listar sessões', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma sessão específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma sessão', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma sessão', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma sessão', key: 'delete', label: 'Eliminar' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de sessões.',
	scope: Permissions.sessions.scope,
	title: 'Permissões de Sessões',
};

const stopActions: PermissionConfig<typeof Permissions.stops.actions> = {
	actions: [
		{ description: 'Permite listar paragens', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma paragem específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma paragem', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma paragem', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma paragem', key: 'delete', label: 'Eliminar' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de paragens.',
	scope: Permissions.stops.scope,
	title: 'Permissões de Paragens',
};

const rideActions: PermissionConfig<typeof Permissions.rides.actions> = {
	actions: [
		{ description: 'Permite listar viagens', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma viagem específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma viagem', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma viagem', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma viagem', key: 'delete', label: 'Eliminar' },
	],
	description: 'As ações que o utilizador pode realizar na gestão de viagens.',
	scope: Permissions.rides.scope,
	title: 'Permissões de Viagens',
};

/* * */

export const permissionsConfig: PermissionConfig[] = [
	agencyActions,
	alertActions,
	fileActions,
	hashedShapeActions,
	hashedTripActions,
	municipalityActions,
	organizationActions,
	planActions,
	userActions,
	validationActions,
	roleActions,
	sessionActions,
	stopActions,
	rideActions,
];
