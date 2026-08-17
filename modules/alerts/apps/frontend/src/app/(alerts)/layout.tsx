/* * */

import { AlertsList } from '@/components/list/shared/AlertsList';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="alerts"
			panes={[
				<AlertsList key="alerts-list" />,
				children,
			]}
		/>
	);
}
