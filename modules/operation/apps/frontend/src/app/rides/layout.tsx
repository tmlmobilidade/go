/* * */

import { RidesList } from '@/components/rides/list/RidesList';
import { PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="rides"
			panes={[
				<RidesList key="rides-list" />,
				<Fragment key="rides-detail">{children}</Fragment>,
			]}
		/>
	);
}
