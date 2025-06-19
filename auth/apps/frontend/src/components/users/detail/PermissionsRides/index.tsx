'use client';

import CheckCard from '@/components/common/CheckCard';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { Permissions } from '@tmlmobilidade/lib';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

export function PermissionsRides() {
	const { actions, data } = useUsersDetailContext();

	// Helper to get permission
	const getPermissionData = (action: keyof typeof Permissions.rides.actions) => {
		const permission = data.form.values.permissions.find(
			p => p.scope === Permissions.rides.scope && p.action === action,
		);
		return {
			hasPermission: !!permission,
		};
	};

	const rideActions: { description: string, key: keyof typeof Permissions.rides.actions, label: string }[] = [
		{ description: 'Permite listar viagens', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma viagem específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma viagem', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma viagem', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma viagem', key: 'delete', label: 'Eliminar' },
	];

	return (
		<Collapsible
			description="As ações que o utilizador pode realizar na gestão de viagens."
			title="Permissões de Viagens"
		>
			<Section gap="md">
				<Grid columns="ab" gap="sm">
					{rideActions.map(({ description, key, label }) => {
						const { hasPermission } = getPermissionData(key as keyof typeof Permissions.rides.actions);

						return (
							<CheckCard
								key={key}
								checked={hasPermission}
								description={description}
								label={label}
								onChange={() =>
									actions.handlePermissionToggle(Permissions.rides.scope, key)}
							/>
						);
					})}
				</Grid>
			</Section>
		</Collapsible>
	);
}
