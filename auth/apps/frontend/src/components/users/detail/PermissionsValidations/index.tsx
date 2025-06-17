'use client';

import CheckCard from '@/components/common/CheckCard';
import { useUsersDetailContext } from '@/contexts/UsersDetail.context';
import { Permissions } from '@tmlmobilidade/lib';
import { Collapsible, Grid, Section } from '@tmlmobilidade/ui';

export function PermissionsValidations() {
	const { actions, data } = useUsersDetailContext();

	// Helper to get permission
	const getPermissionData = (action: keyof typeof Permissions.validations.actions) => {
		const permission = data.form.values.permissions.find(
			p => p.scope === Permissions.validations.scope && p.action === action,
		);
		return {
			hasPermission: !!permission,
		};
	};

	const validationActions: { description: string, key: keyof typeof Permissions.validations.actions, label: string }[] = [
		{ description: 'Permite listar validações', key: 'list', label: 'Listar' },
		{ description: 'Permite visualizar uma validação específica', key: 'read', label: 'Ver' },
		{ description: 'Permite criar uma validação', key: 'create', label: 'Criar' },
		{ description: 'Permite atualizar uma validação', key: 'update', label: 'Atualizar' },
		{ description: 'Permite eliminar uma validação', key: 'delete', label: 'Eliminar' },
	];

	return (
		<Collapsible
			description="As ações que o utilizador pode realizar na gestão de validações."
			title="Permissões de Validações"
		>
			<Section gap="md">
				<Grid columns="ab" gap="sm">
					{validationActions.map(({ description, key, label }) => {
						const { hasPermission } = getPermissionData(key as keyof typeof Permissions.validations.actions);

						return (
							<CheckCard
								key={key}
								checked={hasPermission}
								description={description}
								label={label}
								onChange={() =>
									actions.handlePermissionToggle(Permissions.validations.scope, key)}
							/>
						);
					})}
				</Grid>
			</Section>
		</Collapsible>
	);
}
