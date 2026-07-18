'use client';

import { SidebarContextProvider } from '../Sidebar.context';
import { SidebarBackdrop } from '../SidebarBackdrop';
import { SidebarMain } from '../SidebarMain';

/* * */

export function Sidebar() {
	return (
		<SidebarContextProvider>
			<SidebarBackdrop />
			<SidebarMain />
		</SidebarContextProvider>
	);
}
