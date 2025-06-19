'use client';

import CheckCard from '@/components/common/CheckCard';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { Permissions } from '@tmlmobilidade/lib';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

export function PermissionsStops() {
	const { actions, data } = useUsersDetailContext();

	// Helper to get permission
	const getPermissionData = (action: keyof typeof Permissions.stops.actions) => {
		const permission = data.form.values.permissions.find(
			p => p.scope === Permissions.stops.scope && p.action === action,
		);
		return {
			hasPermission: !!permission,
		};
	};

	const stopActions: { description: string, key: keyof typeof Permissions.stops.actions, label: string }[] = [
		{ description: 'Permite listar paragens', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma paragem específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma paragem', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma paragem', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma paragem', key: 'delete', label: 'Eliminar' },
	];

	return (
		<Collapsible
			description="As ações que o utilizador pode realizar na gestão de paragens."
			title="Permissões de Paragens"
		>
			<Section gap="md">
				<Grid columns="ab" gap="sm">
					{stopActions.map(({ description, key, label }) => {
						const { hasPermission } = getPermissionData(key as keyof typeof Permissions.stops.actions);

						return (
							<CheckCard
								key={key}
								checked={hasPermission}
								description={description}
								label={label}
								onChange={() =>
									actions.handlePermissionToggle(Permissions.stops.scope, key)}
							/>
						);
					})}
				</Grid>
			</Section>
		</Collapsible>
	);
}
