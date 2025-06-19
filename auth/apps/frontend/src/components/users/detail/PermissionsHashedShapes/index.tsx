'use client';

import CheckCard from '@/components/common/CheckCard';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { Permissions } from '@tmlmobilidade/lib';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

export function PermissionsHashedShapes() {
	const { actions, data } = useUsersDetailContext();

	// Helper to get permission
	const getPermissionData = (action: keyof typeof Permissions.hashedShapes.actions) => {
		const permission = data.form.values.permissions.find(
			p => p.scope === Permissions.hashedShapes.scope && p.action === action,
		);
		return {
			hasPermission: !!permission,
		};
	};

	const hashedShapeActions: { description: string, key: keyof typeof Permissions.hashedShapes.actions, label: string }[] = [
		{ description: 'Permite listar formas codificadas', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma forma codificada específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma forma codificada', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma forma codificada', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma forma codificada', key: 'delete', label: 'Eliminar' },
	];

	return (
		<Collapsible
			description="As ações que o utilizador pode realizar na gestão de formas codificadas."
			title="Permissões de Formas Codificadas"
		>
			<Section gap="md">
				<Grid columns="ab" gap="sm">
					{hashedShapeActions.map(({ description, key, label }) => {
						const { hasPermission } = getPermissionData(key as keyof typeof Permissions.hashedShapes.actions);

						return (
							<CheckCard
								key={key}
								checked={hasPermission}
								description={description}
								label={label}
								onChange={() =>
									actions.handlePermissionToggle(Permissions.hashedShapes.scope, key)}
							/>
						);
					})}
				</Grid>
			</Section>
		</Collapsible>
	);
}
