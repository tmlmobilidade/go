'use client';

/* * */

import { PermissionSection } from '@/components/permissions/PermissionSection';
import { RoleDetailBasicInfo } from '@/components/roles/detail/RoleDetailBasicInfo';
import { RoleDetailHeader } from '@/components/roles/detail/RoleDetailHeader';
import { useRoleDetailContext } from '@/contexts/RoleDetail.context';
import { permissionsConfig } from '@/lib/permissions';
import { Pane } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RoleDetail() {
	//

	//
	// A. Setup variables

	const rolesDetailContext = useRoleDetailContext();
	const { t } = useTranslation('global', { keyPrefix: 'permissions' });

	//
	// B. Render components

	return (
		<Pane header={[<RoleDetailHeader />]}>
			<RoleDetailBasicInfo />
			{permissionsConfig.map(item => (
				<PermissionSection
					key={item.scope}
					configActions={item.actions}
					description={t(item.description)}
					enabledPermissions={rolesDetailContext.data.form.values.permissions}
					onResourceToggle={rolesDetailContext.actions.handlePermissionResourceToggle}
					onToggle={() => console.log('choruizo', t(item.title))}
					scope={item.scope}
					title={t(item.title)}
				/>
			))}
		</Pane>
	);

	//
}
