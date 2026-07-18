'use client';

import { useCurrentUrl } from '../../../hooks/use-current-url';
import { SidebarContextProvider } from '../Sidebar.context';
import { SidebarBackdrop } from '../SidebarBackdrop';
import { SidebarOpenGroupsProvider } from '../SidebarOpenGroups.context';
import { SidebarView } from '../SidebarView';
import { getDefaultOpenGroupIds } from '../utils';

/* * */

export function Sidebar() {
	//

	//
	// A. Setup variables

	const currentUrl = useCurrentUrl();

	const pathname = currentUrl?.pathname;

	const defaultOpenGroupIds = getDefaultOpenGroupIds(pathname);

	//
	// B. Render components

	return (
		<SidebarContextProvider>

			<SidebarBackdrop />

			<SidebarOpenGroupsProvider defaultOpenGroupIds={defaultOpenGroupIds}>
				<SidebarView />
			</SidebarOpenGroupsProvider>

		</SidebarContextProvider>
	);
}
