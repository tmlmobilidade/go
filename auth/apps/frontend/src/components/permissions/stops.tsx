'use client';

import { Permissions } from '@tmlmobilidade/lib';
import { StopPermission } from '@tmlmobilidade/types';

import { PermissionSectionInputProps, PermissionsSection } from './components/PermissionSection';

export function PermissionsStops({ onToggle, permissions }: PermissionSectionInputProps<StopPermission>) {
	const stopActions: { description: string, key: keyof typeof Permissions.stops.actions, label: string }[] = [
		{ description: 'Permite listar paragens', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma paragem específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma paragem', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma paragem', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma paragem', key: 'delete', label: 'Eliminar' },
	];

	return (
		<PermissionsSection
			actions={stopActions}
			currentPermissions={permissions}
			description="As ações que o utilizador pode realizar na gestão de paragens."
			onToggle={onToggle}
			scope={Permissions.stops.scope}
			title="Permissões de Paragens"
		/>
	);
}
