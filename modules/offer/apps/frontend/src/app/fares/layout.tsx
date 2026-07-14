/* * */

import { FaresList } from '@/components/fares/list/FaresList';
import { FaresListContextProvider } from '@/components/fares/list/FaresList.context';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { ErrorDisplay, HasPermission, PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<HasPermission action={PermissionCatalog.all.fares.actions.nav} fallback={<ErrorDisplay message="Não tem permissão para aceder a esta página." />} scope={PermissionCatalog.all.fares.scope}>
			<PanesManager
				id="fares"
				panes={[
					<FaresListContextProvider key="list">
						<FaresList />
					</FaresListContextProvider>,
					<Fragment key="detail">{children}</Fragment>,
				]}
			/>
		</HasPermission>
	);
}
