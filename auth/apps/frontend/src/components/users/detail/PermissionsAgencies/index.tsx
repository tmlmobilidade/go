'use client';

import CheckCard from '@/components/common/CheckCard';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { Permissions } from '@tmlmobilidade/lib';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

export function PermissionsAgencies() {
	const { actions, data } = useUsersDetailContext();

	// Helper to get permission
	const getPermissionData = (action: keyof typeof Permissions.agencies.actions) => {
		const permission = data.form.values.permissions.find(
			p => p.scope === Permissions.agencies.scope && p.action === action,
		);
		return {
			hasPermission: !!permission,
		};
	};

	const agencyActions: { description: string, key: keyof typeof Permissions.agencies.actions, label: string }[] = [
		{ description: 'Permite listar agências', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma agência específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma agência', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma agência', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma agência', key: 'delete', label: 'Eliminar' },
	];

	return (
		<Collapsible
			description="As ações que o utilizador pode realizar na gestão de agências."
			title="Permissões de Agências"
		>
			<Section gap="md">
				<Grid columns="ab" gap="sm">
					{agencyActions.map(({ description, key, label }) => {
						const { hasPermission } = getPermissionData(key as keyof typeof Permissions.agencies.actions);

						return (
							<CheckCard
								key={key}
								checked={hasPermission}
								description={description}
								label={label}
								onChange={() =>
									actions.handlePermissionToggle(Permissions.agencies.scope, key)}
							/>
						);
					})}
				</Grid>
			</Section>
		</Collapsible>
	);
}
