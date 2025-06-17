'use client';

import CheckCard from '@/components/common/CheckCard';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { Permissions } from '@tmlmobilidade/lib';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

export function PermissionsSessions() {
	const { actions, data } = useUsersDetailContext();

	// Helper to get permission
	const getPermissionData = (action: keyof typeof Permissions.sessions.actions) => {
		const permission = data.form.values.permissions.find(
			p => p.scope === Permissions.sessions.scope && p.action === action,
		);
		return {
			hasPermission: !!permission,
		};
	};

	const sessionActions: { description: string, key: keyof typeof Permissions.sessions.actions, label: string }[] = [
		{ description: 'Permite listar sessões', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma sessão específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma sessão', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma sessão', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma sessão', key: 'delete', label: 'Eliminar' },
	];

	return (
		<Collapsible
			description="As ações que o utilizador pode realizar na gestão de sessões."
			title="Permissões de Sessões"
		>
			<Section gap="md">
				<Grid columns="ab" gap="sm">
					{sessionActions.map(({ description, key, label }) => {
						const { hasPermission } = getPermissionData(key as keyof typeof Permissions.sessions.actions);

						return (
							<CheckCard
								key={key}
								checked={hasPermission}
								description={description}
								label={label}
								onChange={() =>
									actions.handlePermissionToggle(Permissions.sessions.scope, key)}
							/>
						);
					})}
				</Grid>
			</Section>
		</Collapsible>
	);
}
