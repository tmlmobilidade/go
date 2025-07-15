'use client';

import { Permissions } from '@tmlmobilidade/lib';

import { PermissionSectionInputProps, PermissionsSection } from './components/PermissionSection';

export function PermissionsHashedShapes({ onToggle, permissions }: PermissionSectionInputProps) {
	const hashedShapeActions: { description: string, key: keyof typeof Permissions.hashedShapes.actions, label: string }[] = [
		{ description: 'Permite listar formas codificadas', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma forma codificada específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma forma codificada', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma forma codificada', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma forma codificada', key: 'delete', label: 'Eliminar' },
	];

	return (
		<PermissionsSection
			actions={hashedShapeActions}
			currentPermissions={permissions}
			description="As ações que o utilizador pode realizar na gestão de formas codificadas."
			onToggle={onToggle}
			scope={Permissions.hashedShapes.scope}
			title="Permissões de Formas Codificadas"
		/>
	);
}
