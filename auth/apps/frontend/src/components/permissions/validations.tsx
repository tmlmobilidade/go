'use client';

import { AgencyPermissionMultiselect } from '@/components/permissions/components/AgencyPermissionMultiselect';
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
			onToggle={onToggle}
			scope={Permissions.validations.scope}
			title="Permissões de Validações"
		>
			<AgencyPermissionMultiselect
				description="Agências ao qual o utilizador tem acesso a para esta ação"
				label="Agências"
				onChange={value => onResourceToggle?.(Permissions.validations.scope, 'update', { agency_ids: value || [] })}
				selected={permissions.find(p => p.scope === Permissions.validations.scope && p.action === 'update')?.resource?.agency_ids || []}
			/>
		</PermissionsSection>
	);
}
