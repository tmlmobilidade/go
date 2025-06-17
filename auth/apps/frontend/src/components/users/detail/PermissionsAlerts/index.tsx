'use client';

import CheckCard from '@/components/common/CheckCard';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { Permissions } from '@tmlmobilidade/lib';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

export function PermissionsAlerts() {
	const { actions, data } = useUsersDetailContext();

	// Helper to get permission
	const getPermissionData = (action: keyof typeof Permissions.alerts.actions) => {
		const permission = data.form.values.permissions.find(
			p => p.scope === Permissions.alerts.scope && p.action === action,
		);
		return {
			hasPermission: !!permission,
		};
	};

	const alertActions: { description: string, key: keyof typeof Permissions.alerts.actions, label: string }[] = [
		{ description: 'Permite listar alertas', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar um alerta específico', key: 'read', label: 'Ver' },
		{ description: 'Permite criar um alerta', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar um alerta', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar um alerta', key: 'delete', label: 'Eliminar' },
	];

	return (
		<Collapsible
			description="As ações que o utilizador pode realizar na gestão de alertas."
			title="Permissões de Alertas"
		>
			<Section gap="md">
				<Grid columns="ab" gap="sm">
					{alertActions.map(({ description, key, label }) => {
						const { hasPermission } = getPermissionData(key as keyof typeof Permissions.alerts.actions);

						return (
							<CheckCard
								key={key}
								checked={hasPermission}
								description={description}
								label={label}
								onChange={() =>
									actions.handlePermissionToggle(Permissions.alerts.scope, key)}
							/>
						);
					})}
				</Grid>
			</Section>
		</Collapsible>
	);
}
