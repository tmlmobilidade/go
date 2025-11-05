'use client';

/* * */

import { QuickLinks } from '@/components/home/QuickLinks';
import { WelcomeMessage } from '@/components/home/WelcomeMessage';
import { WikiList } from '@/components/home/WikiList';
import { Permissions } from '@go/consts';
import { Divider, Pane, useMeContext } from '@go/ui';

/* * */

export function HomePage() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	//
	// B. Transform data

	const hasQuickLinksPermission = meContext.actions.hasPermission(Permissions.home.scope, Permissions.home.actions.read_links);

	const hasWikiListPermission = meContext.actions.hasPermission(Permissions.home.scope, Permissions.home.actions.read_wiki);

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
