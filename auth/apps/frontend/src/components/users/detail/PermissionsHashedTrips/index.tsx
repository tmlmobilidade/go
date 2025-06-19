'use client';

import CheckCard from '@/components/common/CheckCard';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { Permissions } from '@tmlmobilidade/lib';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

export function PermissionsHashedTrips() {
	const { actions, data } = useUsersDetailContext();

	// Helper to get permission
	const getPermissionData = (action: keyof typeof Permissions.hashedTrips.actions) => {
		const permission = data.form.values.permissions.find(
			p => p.scope === Permissions.hashedTrips.scope && p.action === action,
		);
		return {
			hasPermission: !!permission,
		};
	};

	const hashedTripActions: { description: string, key: keyof typeof Permissions.hashedTrips.actions, label: string }[] = [
		{ description: 'Permite listar viagens codificadas', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma viagem codificada específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma viagem codificada', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma viagem codificada', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma viagem codificada', key: 'delete', label: 'Eliminar' },
	];

	return (
		<Collapsible
			description="As ações que o utilizador pode realizar na gestão de viagens codificadas."
			title="Permissões de Viagens Codificadas"
		>
			<Section gap="md">
				<Grid columns="ab" gap="sm">
					{hashedTripActions.map(({ description, key, label }) => {
						const { hasPermission } = getPermissionData(key as keyof typeof Permissions.hashedTrips.actions);

						return (
							<CheckCard
								key={key}
								checked={hasPermission}
								description={description}
								label={label}
								onChange={() =>
									actions.handlePermissionToggle(Permissions.hashedTrips.scope, key)}
							/>
						);
					})}
				</Grid>
			</Section>
		</Collapsible>
	);
}
