'use client';

/* * */

import { ZonesList } from '@/components/zones/list/ZonesList';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ErrorDisplay, HasPermission, PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function ZonesLayout({ children }: PropsWithChildren) {
	const { t } = useTranslation();

	return (
		<HasPermission action={PermissionCatalog.all.zones.actions.nav} fallback={<ErrorDisplay message={t('default:zones.noAccess')} />} scope={PermissionCatalog.all.zones.scope}>
			<PanesManager
				id="zones"
				panes={[
					<ZonesList key="list" />,
					<Fragment key="detail">{children}</Fragment>,
				]}
			/>
		</HasPermission>
	);
}
