'use client';

import { Permissions } from '@tmlmobilidade/lib';

import { PermissionSectionInputProps, PermissionsSection } from './components/PermissionSection';

export function PermissionsSessions({ onToggle, permissions }: PermissionSectionInputProps) {
	const sessionActions: { description: string, key: keyof typeof Permissions.sessions.actions, label: string }[] = [
		{ description: 'Permite listar sessões', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma sessão específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma sessão', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma sessão', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma sessão', key: 'delete', label: 'Eliminar' },
	];

	return (
		<PermissionsSection
			actions={sessionActions}
			currentPermissions={permissions}
			description="As ações que o utilizador pode realizar na gestão de sessões."
			onToggle={onToggle}
			scope={Permissions.sessions.scope}
			title="Permissões de Sessões"
		/>
	);
}
