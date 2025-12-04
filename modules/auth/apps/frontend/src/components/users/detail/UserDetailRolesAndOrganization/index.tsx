'use client';

/* * */

import { UserDetailOrganization } from '@/components/users/detail/UserDetailOrganization';
import { UserDetailRoles } from '@/components/users/detail/UserDetailRoles';
import { Collapsible } from '@tmlmobilidade/ui';

/* * */

export function UserDetailRolesAndOrganization() {
	return (
		<Collapsible
			description="O conjunto de permissões que o utilizador tem atribuído no sistema e as organizações a que pertence."
			title="Roles & Organizações"
			defaultOpen
		>
			<UserDetailOrganization />
			<UserDetailRoles />
		</Collapsible>
	);
}
