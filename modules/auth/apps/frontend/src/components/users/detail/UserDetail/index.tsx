'use client';

/* * */

import { PermissionSection } from '@/components/permissions/PermissionSection';
import { useUserDetailContext } from '@/components/users/detail/UserDetail.context';
import { UserDetailBasicInfo } from '@/components/users/detail/UserDetailBasicInfo';
import { UserDetailHeader } from '@/components/users/detail/UserDetailHeader';
import { UserDetailRolesAndOrganization } from '@/components/users/detail/UserDetailRolesAndOrganization';
import { permissionsConfig } from '@/lib/permissions';
import { Pane } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function UserDetail() {
	//

	//
	// A. Setup variables

	const userDetailContext = useUserDetailContext();
	const { t } = useTranslation('global', { keyPrefix: 'permissions' });

	//
	// B. Render components

	return (
		<Pane header={[<UserDetailHeader />]}>
			<UserDetailBasicInfo />
			<UserDetailRolesAndOrganization />
			{permissionsConfig.map(item => (
				<PermissionSection
					key={item.scope}
					configActions={item.actions}
					description={t(item.description)}
					enabledPermissions={userDetailContext.data.form.values.permissions}
					enabledRoleIds={userDetailContext.data.form.values.role_ids}
					onResourceToggle={userDetailContext.actions.handlePermissionResourceToggle}
					onToggle={userDetailContext.actions.handlePermissionToggle}
					scope={item.scope}
					title={t(item.title)}
				/>
			))}
		</Pane>
	);

	//
}
