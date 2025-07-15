'use client';

import { Permissions } from '@tmlmobilidade/lib';

import { PermissionSectionInputProps, PermissionsSection } from './components/PermissionSection';

export function PermissionsUsers({ onToggle, permissions }: PermissionSectionInputProps) {
	const userActions: { description: string, key: keyof typeof Permissions.users.actions, label: string }[] = [
		{ description: 'Permite listar utilizadores', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar um utilizador específico', key: 'read', label: 'Ver' },
		{ description: 'Permite criar um utilizador', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar um utilizador', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar um utilizador', key: 'delete', label: 'Eliminar' },
	];

	return (
		<PermissionsSection
			actions={userActions}
			currentPermissions={permissions}
			description="As ações que o utilizador pode realizar na gestão de utilizadores."
			onToggle={onToggle}
			scope={Permissions.users.scope}
			title="Permissões de Utilizadores"
		/>
	);
}
