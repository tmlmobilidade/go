'use client';

import { Permissions } from '@tmlmobilidade/lib';

import { PermissionSectionInputProps, PermissionsSection } from './components/PermissionSection';

export function PermissionsRides({ onToggle, permissions }: PermissionSectionInputProps) {
	const rideActions: { description: string, key: keyof typeof Permissions.rides.actions, label: string }[] = [
		{ description: 'Permite listar viagens', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma viagem específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma viagem', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma viagem', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma viagem', key: 'delete', label: 'Eliminar' },
	];

	return (
		<PermissionsSection
			actions={rideActions}
			currentPermissions={permissions}
			description="As ações que o utilizador pode realizar na gestão de viagens."
			onToggle={onToggle}
			scope={Permissions.rides.scope}
			title="Permissões de Viagens"
		/>
	);
}
