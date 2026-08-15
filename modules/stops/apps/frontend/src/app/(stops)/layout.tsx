/* * */

import { StopsList } from '@/components/stops/list/StopsList';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="stops-list"
			panes={[
				<StopsList key="stops-list" />,
				children,
			]}
		/>
	);
}
