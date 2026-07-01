/* * */

import { FaresList } from '@/components/fares/list/FaresList';
import { FaresListContextProvider } from '@/components/fares/list/FaresList.context';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { PanesManager, PermissionGuard } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PermissionGuard action={PermissionCatalog.all.fares.actions.nav} scope={PermissionCatalog.all.fares.scope}>
			<PanesManager
				id="fares"
				panes={[
					<FaresListContextProvider key="list">
						<FaresList />
					</FaresListContextProvider>,
					<Fragment key="detail">{children}</Fragment>,
				]}
			/>
		</PermissionGuard>
	);
}
