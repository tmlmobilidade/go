'use client';

import CheckCard from '@/components/common/CheckCard';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { Permissions } from '@tmlmobilidade/lib';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

export function PermissionsUsers() {
	const { actions, data } = useUsersDetailContext();

	// Helper to get permission
	const getPermissionData = (action: keyof typeof Permissions.users.actions) => {
		const permission = data.form.values.permissions.find(
			p => p.scope === Permissions.users.scope && p.action === action,
		);
		return {
			hasPermission: !!permission,
		};
	};

	const userActions: { description: string, key: keyof typeof Permissions.users.actions, label: string }[] = [
		{ description: 'Permite listar utilizadores', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar um utilizador específico', key: 'read', label: 'Ver' },
		{ description: 'Permite criar um utilizador', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar um utilizador', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar um utilizador', key: 'delete', label: 'Eliminar' },
	];

	return (
		<Collapsible
			description="As ações que o utilizador pode realizar na gestão de utilizadores."
			title="Permissões de Utilizadores"
		>
			<Section gap="md">
				<Grid columns="ab" gap="sm">
					{userActions.map(({ description, key, label }) => {
						const { hasPermission } = getPermissionData(key as keyof typeof Permissions.users.actions);

						return (
							<CheckCard
								key={key}
								checked={hasPermission}
								description={description}
								label={label}
								onChange={() =>
									actions.handlePermissionToggle(Permissions.users.scope, key)}
							/>
						);
					})}
				</Grid>
			</Section>
		</Collapsible>
	);
}
