'use client';

import CheckCard from '@/components/common/CheckCard';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { Permissions } from '@tmlmobilidade/lib';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

export function PermissionsOrganizations() {
	const { actions, data } = useUsersDetailContext();

	// Helper to get permission
	const getPermissionData = (action: keyof typeof Permissions.organizations.actions) => {
		const permission = data.form.values.permissions.find(
			p => p.scope === Permissions.organizations.scope && p.action === action,
		);
		return {
			hasPermission: !!permission,
		};
	};

	const organizationActions: { description: string, key: keyof typeof Permissions.organizations.actions, label: string }[] = [
		{ description: 'Permite listar organizações', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma organização específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma organização', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma organização', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma organização', key: 'delete', label: 'Eliminar' },
	];

	return (
		<Collapsible
			description="As ações que o utilizador pode realizar na gestão de organizações."
			title="Permissões de Organizações"
		>
			<Section gap="md">
				<Grid columns="ab" gap="sm">
					{organizationActions.map(({ description, key, label }) => {
						const { hasPermission } = getPermissionData(key as keyof typeof Permissions.organizations.actions);

						return (
							<CheckCard
								key={key}
								checked={hasPermission}
								description={description}
								label={label}
								onChange={() =>
									actions.handlePermissionToggle(Permissions.organizations.scope, key)}
							/>
						);
					})}
				</Grid>
			</Section>
		</Collapsible>
	);
}
