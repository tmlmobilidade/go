/* * */

import { TypologiesList } from '@/components/typologies/list/TypologiesList';
import { TypologiesListContextProvider } from '@/components/typologies/list/TypologiesList.context';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { PanesManager, PermissionGuard } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PermissionGuard action={PermissionCatalog.all.typologies.actions.nav} scope={PermissionCatalog.all.typologies.scope}>
			<PanesManager
				id="typologies"
				panes={[
					<TypologiesListContextProvider key="list">
						<TypologiesList />
					</TypologiesListContextProvider>,
					<Fragment key="detail">{children}</Fragment>,
				]}
			/>
		</PermissionGuard>
	);
}
