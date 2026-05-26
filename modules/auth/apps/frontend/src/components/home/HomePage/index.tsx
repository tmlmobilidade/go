'use client';

import { QuickLinks } from '@/components/home/QuickLinks';
import { WelcomeMessage } from '@/components/home/WelcomeMessage';
import { WikiList } from '@/components/home/WikiList';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Divider, Pane, useMeContext } from '@tmlmobilidade/ui';

/* * */

export function HomePage() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	//
	// B. Transform data

	const hasQuickLinksPermission = meContext.actions.hasPermission(PermissionCatalog.all.home.scope, PermissionCatalog.all.home.actions.read_links);
	const hasWikiListPermission = meContext.actions.hasPermission(PermissionCatalog.all.home.scope, PermissionCatalog.all.home.actions.read_wiki);

	//
	// C. Render components

	if (!hasQuickLinksPermission && !hasWikiListPermission) {
		return <WelcomeMessage />;
	}

	return (
		<Pane>
			{hasQuickLinksPermission && <QuickLinks />}
			{hasQuickLinksPermission && hasWikiListPermission && <Divider />}
			{hasWikiListPermission && <WikiList />}
		</Pane>
	);

	//
}
