'use client';

import { Permissions } from '@tmlmobilidade/lib';
import { PlanPermission } from '@tmlmobilidade/types';

import { PermissionSectionInputProps, PermissionsSection, WithResourceToggle } from './components/PermissionSection';

export function PermissionsPlans({ onResourceToggle, onToggle, permissions }: WithResourceToggle<PermissionSectionInputProps<PlanPermission>, PlanPermission>) {
	const planActions: { description: string, key: keyof typeof Permissions.plans.actions, label: string }[] = [
		{ description: 'Permite listar planos', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar um plano específico', key: 'read', label: 'Ver' },
		{ description: 'Permite criar um plano', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar um plano', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar um plano', key: 'delete', label: 'Eliminar' },
	];

	return (
		<PermissionsSection
			actions={planActions}
			currentPermissions={permissions}
			description="As ações que o utilizador pode realizar na gestão de planos."
			onResourceToggle={onResourceToggle}
			onToggle={onToggle}
			scope={Permissions.plans.scope}
			title="Permissões de Planos"
		/>
	);
}
