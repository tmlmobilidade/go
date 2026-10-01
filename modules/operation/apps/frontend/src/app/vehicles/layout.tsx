/* * */

import { VehiclesList } from '@/components/vehicles/list/VehiclesList';
import { PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="vehicles"
			panes={[
				<VehiclesList key="list" />,
				<Fragment key="children">{children}</Fragment>,
			]}
		/>
	);
}
