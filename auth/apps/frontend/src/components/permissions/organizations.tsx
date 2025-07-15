'use client';

import { Permissions } from '@tmlmobilidade/lib';

import { PermissionSectionInputProps, PermissionsSection } from './components/PermissionSection';

export function PermissionsOrganizations({ onToggle, permissions }: PermissionSectionInputProps) {
	const organizationActions: { description: string, key: keyof typeof Permissions.organizations.actions, label: string }[] = [
		{ description: 'Permite listar organizações', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma organização específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma organização', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma organização', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma organização', key: 'delete', label: 'Eliminar' },
	];

	return (
		<PermissionsSection
			actions={organizationActions}
			currentPermissions={permissions}
			description="As ações que o utilizador pode realizar na gestão de organizações."
			onToggle={onToggle}
			scope={Permissions.organizations.scope}
			title="Permissões de Organizações"
		/>
	);
}
