'use client';

import { QuickLinks } from '@/components/home/QuickLinks';
import { WelcomeMessage } from '@/components/home/WelcomeMessage';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Pane, useMeContext } from '@tmlmobilidade/ui';

/* * */

export function HomePage() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	//
	// B. Transform data

	const hasQuickLinksPermission = meContext.actions.hasPermission(PermissionCatalog.all.home.scope, PermissionCatalog.all.home.actions.read_links);

	//
	// C. Render components

	if (!hasQuickLinksPermission) {
		return <WelcomeMessage />;
	}

	return (
		<Pane>
			{hasQuickLinksPermission && <QuickLinks />}
		</Pane>
	);

	//
}
