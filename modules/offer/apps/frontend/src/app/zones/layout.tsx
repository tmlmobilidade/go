/* * */

import { ZonesList } from '@/components/zones/list/ZonesList';
import { ZonesListContextProvider } from '@/components/zones/list/ZonesList.context';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { ErrorDisplay, HasPermission, PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<HasPermission action={PermissionCatalog.all.zones.actions.nav} fallback={<ErrorDisplay message="Não tem permissão para aceder a esta página." />} scope={PermissionCatalog.all.zones.scope}>
			<PanesManager
				id="zones"
				panes={[
					<ZonesListContextProvider key="list">
						<ZonesList />
					</ZonesListContextProvider>,
					<Fragment key="detail">{children}</Fragment>,
				]}
			/>
		</HasPermission>
	);
}
