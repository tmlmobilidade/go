'use client';

import { Permissions } from '@tmlmobilidade/lib';

import { PermissionSectionInputProps, PermissionsSection } from './components/PermissionSection';

export function PermissionsHashedTrips({ onToggle, permissions }: PermissionSectionInputProps) {
	const hashedTripActions: { description: string, key: keyof typeof Permissions.hashedTrips.actions, label: string }[] = [
		{ description: 'Permite listar viagens codificadas', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma viagem codificada específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma viagem codificada', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma viagem codificada', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma viagem codificada', key: 'delete', label: 'Eliminar' },
	];

	return (
		<PermissionsSection
			actions={hashedTripActions}
			currentPermissions={permissions}
			description="As ações que o utilizador pode realizar na gestão de viagens codificadas."
			onToggle={onToggle}
			scope={Permissions.hashedTrips.scope}
			title="Permissões de Viagens Codificadas"
		/>
	);
}
