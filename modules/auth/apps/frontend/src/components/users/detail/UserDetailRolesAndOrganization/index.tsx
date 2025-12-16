'use client';

/* * */

import { UserDetailOrganization } from '@/components/users/detail/UserDetailOrganization';
import { UserDetailRoles } from '@/components/users/detail/UserDetailRoles';
import { Collapsible } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function UserDetailRolesAndOrganization() {
	//

	//
	// A. Setup Variables

	const { t } = useTranslation('auth', { keyPrefix: 'users.detail.rolesAndOrganization' });

	//
	// B. Render Components

	return (
		<Collapsible description={t('description')} title={t('title')} defaultOpen>
			<UserDetailOrganization />
			<UserDetailRoles />
		</Collapsible>
	);
}
