'use client';

/* * */

import { PermissionSection } from '@/components/permissions/PermissionSection';
import { useRoleDetailContext } from '@/components/roles/detail/RoleDetail.context';
import { RoleDetailBasicInfo } from '@/components/roles/detail/RoleDetailBasicInfo';
import { RoleDetailHeader } from '@/components/roles/detail/RoleDetailHeader';
import { permissionsConfig } from '@/lib/permissions';
import { Pane } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RoleDetail() {
	//

	//
	// A. Setup variables

	const rolesDetailContext = useRoleDetailContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Pane header={[<RoleDetailHeader />]}>
			<RoleDetailBasicInfo />
			{permissionsConfig.map(item => (
				<PermissionSection
					key={item.scope}
					configActions={item.actions}
					description={t('default:permissions.' + item.description)}
					enabledPermissions={rolesDetailContext.data.form.values.permissions}
					onResourceToggle={rolesDetailContext.actions.handlePermissionResourceToggle}
					onToggle={rolesDetailContext.actions.handlePermissionToggle}
					scope={item.scope}
					title={t('default:permissions.' + item.title)}
				/>
			))}
		</Pane>
	);

	//
}
