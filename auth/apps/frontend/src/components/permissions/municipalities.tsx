'use client';

import { Permissions } from '@tmlmobilidade/lib';

import { PermissionSectionInputProps, PermissionsSection } from './components/PermissionSection';

export function PermissionsMunicipalities({ onToggle, permissions }: PermissionSectionInputProps) {
	const municipalityActions: { description: string, key: keyof typeof Permissions.municipalities.actions, label: string }[] = [
		{ description: 'Permite listar municípios', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar um município específico', key: 'read', label: 'Ver' },
		{ description: 'Permite criar um município', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar um município', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar um município', key: 'delete', label: 'Eliminar' },
	];

	return (
		<PermissionsSection
			actions={municipalityActions}
			currentPermissions={permissions}
			description="As ações que o utilizador pode realizar na gestão de municípios."
			onToggle={onToggle}
			scope={Permissions.municipalities.scope}
			title="Permissões de Municípios"
		/>
	);
}
