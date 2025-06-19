'use client';

import CheckCard from '@/components/common/CheckCard';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { Permissions } from '@tmlmobilidade/lib';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

export function PermissionsRoles() {
	const { actions, data } = useUsersDetailContext();

	// Helper to get permission
	const getPermissionData = (action: keyof typeof Permissions.roles.actions) => {
		const permission = data.form.values.permissions.find(
			p => p.scope === Permissions.roles.scope && p.action === action,
		);
		return {
			hasPermission: !!permission,
		};
	};

	const roleActions: { description: string, key: keyof typeof Permissions.roles.actions, label: string }[] = [
		{ description: 'Permite listar papéis', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar um papel específico', key: 'read', label: 'Ver' },
		{ description: 'Permite criar um papel', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar um papel', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar um papel', key: 'delete', label: 'Eliminar' },
	];

	return (
		<Collapsible
			description="As ações que o utilizador pode realizar na gestão de papéis."
			title="Permissões de Papéis"
		>
			<Section gap="md">
				<Grid columns="ab" gap="sm">
					{roleActions.map(({ description, key, label }) => {
						const { hasPermission } = getPermissionData(key as keyof typeof Permissions.roles.actions);

						return (
							<CheckCard
								key={key}
								checked={hasPermission}
								description={description}
								label={label}
								onChange={() =>
									actions.handlePermissionToggle(Permissions.roles.scope, key)}
							/>
						);
					})}
				</Grid>
			</Section>
		</Collapsible>
	);
}
