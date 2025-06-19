'use client';

import CheckCard from '@/components/common/CheckCard';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { Permissions } from '@tmlmobilidade/lib';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

export function PermissionsFiles() {
	const { actions, data } = useUsersDetailContext();

	// Helper to get permission
	const getPermissionData = (action: keyof typeof Permissions.files.actions) => {
		const permission = data.form.values.permissions.find(
			p => p.scope === Permissions.files.scope && p.action === action,
		);
		return {
			hasPermission: !!permission,
		};
	};

	const fileActions: { description: string, key: keyof typeof Permissions.files.actions, label: string }[] = [
		{ description: 'Permite listar ficheiros', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar um ficheiro específico', key: 'read', label: 'Ver' },
		{ description: 'Permite carregar um ficheiro', key: 'create', label: 'Carregar' },
		{ description: 'Permite atualizar um ficheiro', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar um ficheiro', key: 'delete', label: 'Eliminar' },
	];

	return (
		<Collapsible
			description="As ações que o utilizador pode realizar na gestão de ficheiros."
			title="Permissões de Ficheiros"
		>
			<Section gap="md">
				<Grid columns="ab" gap="sm">
					{fileActions.map(({ description, key, label }) => {
						const { hasPermission } = getPermissionData(key as keyof typeof Permissions.files.actions);

						return (
							<CheckCard
								key={key}
								checked={hasPermission}
								description={description}
								label={label}
								onChange={() =>
									actions.handlePermissionToggle(Permissions.files.scope, key)}
							/>
						);
					})}
				</Grid>
			</Section>
		</Collapsible>
	);
}
