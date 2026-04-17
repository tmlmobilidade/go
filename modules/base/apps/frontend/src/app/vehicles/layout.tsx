/* * */

import { VehiclesList } from '@/components/Vehicles/list/VehiclesList';
import { VehiclesListContextProvider } from '@/contexts/VehiclesList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="vehicles"
			panes={[
				<VehiclesListContextProvider key="vehicles-list">
					<VehiclesList />
				</VehiclesListContextProvider>,
				children,
			]}
		/>
	);
}
