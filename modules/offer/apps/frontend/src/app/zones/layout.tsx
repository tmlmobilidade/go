/* * */

import { ZonesList } from '@/components/zones/list/ZonesList';
import { ZonesListContextProvider } from '@/components/zones/list/ZonesList.context';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { PanesManager, PermissionGuard } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PermissionGuard action={PermissionCatalog.all.zones.actions.nav} scope={PermissionCatalog.all.zones.scope}>
			<PanesManager
				id="zones"
				panes={[
					<ZonesListContextProvider key="list">
						<ZonesList />
					</ZonesListContextProvider>,
					<Fragment key="detail">{children}</Fragment>,
				]}
			/>
		</PermissionGuard>
	);
}
