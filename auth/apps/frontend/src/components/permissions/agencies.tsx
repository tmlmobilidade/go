'use client';

import { Permissions } from '@tmlmobilidade/lib';
import { AgencyPermission } from '@tmlmobilidade/types';

import { PermissionSectionInputProps, PermissionsSection } from './components/PermissionSection';

/* * */

export function PermissionsAgencies({ onToggle, permissions }: PermissionSectionInputProps<AgencyPermission>) {
	const agencyActions: { description: string, key: keyof typeof Permissions.agencies.actions, label: string }[] = [
		{ description: 'Permite listar agências', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma agência específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma agência', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma agência', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma agência', key: 'delete', label: 'Eliminar' },
	];

	return (
		<PermissionsSection
			actions={agencyActions}
			currentPermissions={permissions}
			description="As ações que o utilizador pode realizar na gestão de agências."
			onToggle={onToggle}
			scope={Permissions.agencies.scope}
			title="Permissões de Agências"
		/>
	);
}
