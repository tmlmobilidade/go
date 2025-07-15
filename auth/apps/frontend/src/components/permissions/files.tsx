'use client';

import { Permissions } from '@tmlmobilidade/lib';

import { PermissionSectionInputProps, PermissionsSection } from './components/PermissionSection';

export function PermissionsFiles({ onToggle, permissions }: PermissionSectionInputProps) {
	const fileActions: { description: string, key: keyof typeof Permissions.files.actions, label: string }[] = [
		{ description: 'Permite listar ficheiros', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar um ficheiro específico', key: 'read', label: 'Ver' },
		{ description: 'Permite carregar um ficheiro', key: 'create', label: 'Carregar' },
		{ description: 'Permite atualizar um ficheiro', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar um ficheiro', key: 'delete', label: 'Eliminar' },
	];

	return (
		<PermissionsSection
			actions={fileActions}
			currentPermissions={permissions}
			description="As ações que o utilizador pode realizar na gestão de ficheiros."
			onToggle={onToggle}
			scope={Permissions.files.scope}
			title="Permissões de Ficheiros"
		/>
	);
}
