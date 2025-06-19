'use client';

import CheckCard from '@/components/common/CheckCard';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { Permissions } from '@tmlmobilidade/lib';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

export function PermissionsMunicipalities() {
	const { actions, data } = useUsersDetailContext();

	// Helper to get permission
	const getPermissionData = (action: keyof typeof Permissions.municipalities.actions) => {
		const permission = data.form.values.permissions.find(
			p => p.scope === Permissions.municipalities.scope && p.action === action,
		);
		return {
			hasPermission: !!permission,
		};
	};

	const municipalityActions: { description: string, key: keyof typeof Permissions.municipalities.actions, label: string }[] = [
		{ description: 'Permite listar municípios', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar um município específico', key: 'read', label: 'Ver' },
		{ description: 'Permite criar um município', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar um município', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar um município', key: 'delete', label: 'Eliminar' },
	];

	return (
		<Collapsible
			description="As ações que o utilizador pode realizar na gestão de municípios."
			title="Permissões de Municípios"
		>
			<Section gap="md">
				<Grid columns="ab" gap="sm">
					{municipalityActions.map(({ description, key, label }) => {
						const { hasPermission } = getPermissionData(key as keyof typeof Permissions.municipalities.actions);

						return (
							<CheckCard
								key={key}
								checked={hasPermission}
								description={description}
								label={label}
								onChange={() =>
									actions.handlePermissionToggle(Permissions.municipalities.scope, key)}
							/>
						);
					})}
				</Grid>
			</Section>
		</Collapsible>
	);
}
