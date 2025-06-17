'use client';

import { AgencyPermissionMultiselect } from '@/components/common/AgenciesMultiselect';
import CheckCard from '@/components/common/CheckCard';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { Permissions } from '@tmlmobilidade/lib';
import { PlanPermission } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

export function PermissionsPlans() {
	const { actions, data } = useUsersDetailContext();

	// Helper to get permission and resource
	const getPermissionData = (action: keyof typeof Permissions.plans.actions) => {
		const permission = data.form.values.permissions.find(
			p => p.scope === Permissions.plans.scope && p.action === action,
		);
		return {
			hasPermission: !!permission,
			resource: permission?.resource as PlanPermission | undefined,
		};
	};

	const planActions: { description: string, key: keyof typeof Permissions.plans.actions, label: string }[] = [
		{ description: 'Permite listar planos', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar um plano específico', key: 'read', label: 'Ver' },
		{ description: 'Permite criar um plano', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar um plano', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar um plano', key: 'delete', label: 'Eliminar' },
	];

	return (
		<Collapsible
			description="As ações que o utilizador pode realizar na aplicação de planos."
			title="Permissões de Planos"
		>
			<Section gap="md">
				<Grid columns="ab" gap="sm">
					{planActions.map(({ description, key, label }) => {
						const { hasPermission, resource } = getPermissionData(key as keyof typeof Permissions.plans.actions);

						return (
							<CheckCard
								key={key}
								checked={hasPermission}
								description={description}
								label={label}
								onChange={() =>
									actions.handlePermissionToggle(Permissions.plans.scope, key)}
							>
								<AgencyPermissionMultiselect
									description="Agências ao qual o utilizador tem acesso a para esta ação"
									disabled={!hasPermission}
									label="Agências"
									onChange={value => actions.handlePermissionResourceToggle(Permissions.plans.scope, key, { agency_ids: value || [] })}
									selected={resource?.agency_ids || []}
								/>
							</CheckCard>
						);
					})}
				</Grid>
			</Section>
		</Collapsible>
	);
}
