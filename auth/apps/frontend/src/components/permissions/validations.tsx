'use client';

import { Permissions } from '@tmlmobilidade/lib';
import { ValidationPermission } from '@tmlmobilidade/types';

import { PermissionSectionInputProps, PermissionsSection, WithResourceToggle } from './components/PermissionSection';

export function PermissionsValidations({ onResourceToggle, onToggle, permissions }: WithResourceToggle<PermissionSectionInputProps<ValidationPermission>, ValidationPermission>) {
	const validationActions: { description: string, key: keyof typeof Permissions.validations.actions, label: string }[] = [
		{ description: 'Permite listar validações', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma validação específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma validação', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma validação', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma validação', key: 'delete', label: 'Eliminar' },
		{ description: 'Permite converter uma validação para um plano', key: 'create_plan', label: 'Converter para plano' },
	];

	return (
		<PermissionsSection
			actions={validationActions}
			currentPermissions={permissions}
			description="As ações que o utilizador pode realizar na gestão de validações."
			onResourceToggle={onResourceToggle}
			onToggle={onToggle}
			scope={Permissions.validations.scope}
			title="Permissões de Validações"
		/>
	);
}
