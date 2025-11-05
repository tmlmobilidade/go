'use client';

import { Collapsible } from '@go/ui';

import { UsersDetailRoles } from '../UserDetailRoles';
import { UsersDetailOrganization } from '../UsersDetailOrganization';

/* * */

/* * */

export function UsersDetailRolesAndOrganization() {
	//

	//
	// A. Render components

	return (
		<Collapsible
			description="O conjunto de permissões que o utilizador tem atribuído no sistema e as organizações a que pertence."
			title="Roles & Organizações"
		>
			<UsersDetailRoles />
			<UsersDetailOrganization />
		</Collapsible>
	);

	//
}
