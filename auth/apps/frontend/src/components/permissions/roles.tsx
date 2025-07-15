'use client';

import { Permissions } from '@tmlmobilidade/lib';

import { PermissionSectionInputProps, PermissionsSection } from './components/PermissionSection';

export function PermissionsRoles({ onToggle, permissions }: PermissionSectionInputProps) {
	const roleActions: { description: string, key: keyof typeof Permissions.roles.actions, label: string }[] = [
		{ description: 'Permite listar papéis', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar um papel específico', key: 'read', label: 'Ver' },
		{ description: 'Permite criar um papel', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar um papel', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar um papel', key: 'delete', label: 'Eliminar' },
	];

	return (
		<PermissionsSection
			actions={roleActions}
			currentPermissions={permissions}
			description="As ações que o utilizador pode realizar na gestão de papéis."
			onToggle={onToggle}
			scope={Permissions.roles.scope}
			title="Permissões de Papéis"
		/>
	);
}
