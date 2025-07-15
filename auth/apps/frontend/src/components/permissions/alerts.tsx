'use client';

import { Permissions } from '@tmlmobilidade/lib';

import { PermissionSectionInputProps, PermissionsSection } from './components/PermissionSection';

export function PermissionsAlerts({ onToggle, permissions }: PermissionSectionInputProps) {
	const alertActions: { description: string, key: keyof typeof Permissions.alerts.actions, label: string }[] = [
		{ description: 'Permite listar alertas', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar um alerta específico', key: 'read', label: 'Ver' },
		{ description: 'Permite criar um alerta', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar um alerta', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar um alerta', key: 'delete', label: 'Eliminar' },
	];

	return (
		<PermissionsSection
			actions={alertActions}
			currentPermissions={permissions}
			description="As ações que o utilizador pode realizar na gestão de alertas."
			onToggle={onToggle}
			scope={Permissions.alerts.scope}
			title="Permissões de Alertas"
		/>
	);
}
